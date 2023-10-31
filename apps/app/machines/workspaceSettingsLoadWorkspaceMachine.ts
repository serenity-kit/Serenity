import {
  LocalDevice,
  decryptWorkspaceInfo,
  decryptWorkspaceKey,
} from "@serenity-tools/common";
import { assign, createMachine } from "xstate";
import {
  WorkspaceDocument,
  WorkspaceQuery,
  WorkspaceQueryVariables,
} from "../generated/graphql";
import { getUrqlClient } from "../utils/urqlClient/urqlClient";
import {
  MeWithWorkspaceLoadingInfoQueryResult,
  loadInitialDataMachine,
} from "./loadInitialData";

export type WorkspaceQueryResult = {
  data?: WorkspaceQuery;
  error?: {
    networkError?: any;
  };
};

type WorkspaceInfo = {
  name: string;
};

type Context = {
  workspaceId?: string;
  navigation: any;
  activeDevice: LocalDevice;
  meWithWorkspaceLoadingInfoQueryResult?: MeWithWorkspaceLoadingInfoQueryResult;
  workspaceQueryResult?: WorkspaceQueryResult;
  workspaceInfo?: WorkspaceInfo;
  currentWorkspaceKey?: {
    key: string;
    id: string;
  };
};

const fetchWorkspace = async (context) => {
  const result = await getUrqlClient()
    .query<WorkspaceQuery, WorkspaceQueryVariables>(
      WorkspaceDocument,
      {
        id: context.workspaceId,
        deviceSigningPublicKey: context.activeDevice.signingPublicKey,
      },
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
      }
    )
    .toPromise();
  return result;
};

export const workspaceSettingsLoadWorkspaceMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QHcD2AnA1rADgQwGMwBlMAFzIEsA7KWAGVTwgHUNt8iBZQgCxrAA6ADZMINKAElqlKnmEARPGTwBiCKmpCaAN1SYho5tNmV5SlTwL8tAbQAMAXUSgcqWKc0uQAD0QAWfwAmQQBOUIA2ewBWCIiADniAdnj-ABoQAE9EAEZo+0FknKSk6P9U-OjQ6IBfGoy0LFxCEnIqWgYxNibOMCsbQzEJEzlFZTUwdHQMQRxhZQAzDABbETERszHLPgEHZyQQNw8qLwO-BByggGYw6uD40Pir0KD4nPiM7IRkwWigqKS9neEWiSRBdQa7GaRFIFAknWY3Q4LX6AjWiKhvXUmm01D0BkEC3I1iR0LAe28R081G85xy9iu-kE-2i0UZjNC9g+WUQb0EVyCQVCOWqQS58WiOQiEJAjWRMLa8MYGJ6KJ2WnRrExLWxGt0+iERLIJO1RFsOX2rnc1NpuQZTJZbP8HK5n0QgoKwRikSCf0BERyVxlcrJsPadGVWtV3HVgxV8rAqkm03Qs3mZCW6FWRpN0fJTkp1pONLOdsZzJBTpd3K+xRuVQiV0BKQSQX8CTq9RA1FQEDg3hDvTDSq6pr6scLx0op1A5wAtDk3Qg59FbuFHrEIu37Fvg2Phx1I6TeqiNUZxLQNuZxpObaWEP4kkvA6F+fkhbE-v5QRK93mDxGo55qecZRgmt7FraCARMK-JXNE8QgqUYKShEz7lIU5SRCUVxvIkCF-gmAEImBZIgZqx4tMQACuBBELA8AHFSkH3nkVwRIIQKtk2ryxIyz5AoI7ZvPSIpvICxSEaGiqHkBCbkeelFEAAYnglDCJAEHTiWs65GyHFcfE1xJLxjbpDyFwpIICT2EkoTwf49lcqEnY1EAA */
  createMachine(
    {
      schema: {
        context: {} as Context,
      },
      context: { navigation: null } as Context,
      tsTypes:
        {} as import("./workspaceSettingsLoadWorkspaceMachine.typegen").Typegen0,
      predictableActionArguments: true,
      initial: "loadingInitialData",
      states: {
        loadingInitialData: {
          invoke: {
            src: "loadInitialDataMachine",
            id: "loadInitialDataMachine",
            data: (context) => {
              return {
                returnOtherWorkspaceIfNotFound: false,
                returnOtherDocumentIfNotFound: true,
                workspaceId: context.workspaceId,
                navigation: context.navigation,
              };
            },
            onDone: [
              {
                target: "loadWorkspace",
                actions: assign({
                  meWithWorkspaceLoadingInfoQueryResult: (_, event) => {
                    return event.data;
                  },
                }),
              },
            ],
            onError: [{}],
          },
        },

        loadWorkspace: {
          invoke: {
            src: "fetchWorkspace",
            id: "fetchWorkspace",
            onDone: [
              {
                actions: assign({
                  workspaceQueryResult: (_, event) => event.data,
                }),
                cond: "hasNoNetworkErrorAndWorkspaceFound",
                target: "loadWorkspaceSuccess",
              },
              {
                target: "loadWorkspaceFailed",
              },
            ],
            onError: [
              {
                target: "loadWorkspaceFailed",
              },
            ],
          },
        },

        loadWorkspaceSuccess: {
          entry: assign({
            currentWorkspaceKey: (context) => {
              if (
                context.workspaceQueryResult?.data?.workspace
                  ?.currentWorkspaceKey?.workspaceKeyBox
              ) {
                const workspaceKeyBox =
                  context.workspaceQueryResult.data.workspace
                    .currentWorkspaceKey.workspaceKeyBox;
                // TODO verify that creator
                // needs a workspace key chain with a main device!
                const workspaceKey = decryptWorkspaceKey({
                  ciphertext: workspaceKeyBox.ciphertext,
                  nonce: workspaceKeyBox.nonce,
                  creatorDeviceEncryptionPublicKey:
                    workspaceKeyBox.creatorDevice.encryptionPublicKey,
                  receiverDeviceEncryptionPrivateKey:
                    context.activeDevice.encryptionPrivateKey,
                });
                return {
                  id: context.workspaceQueryResult.data.workspace
                    .currentWorkspaceKey.id,
                  key: workspaceKey,
                };
              }
              return undefined;
            },
            workspaceInfo: (context) => {
              let workspaceName = "";

              if (context.workspaceQueryResult?.data?.workspace) {
                const workspaceData =
                  context.workspaceQueryResult.data.workspace;

                if (
                  workspaceData.infoCiphertext &&
                  workspaceData.infoNonce &&
                  workspaceData.infoWorkspaceKey?.workspaceKeyBox
                ) {
                  // TODO verify that creator
                  // needs a workspace key chain with a main device!
                  const workspaceKey = decryptWorkspaceKey({
                    ciphertext:
                      workspaceData.infoWorkspaceKey?.workspaceKeyBox
                        ?.ciphertext,
                    nonce:
                      workspaceData.infoWorkspaceKey?.workspaceKeyBox?.nonce,
                    creatorDeviceEncryptionPublicKey:
                      workspaceData.infoWorkspaceKey?.workspaceKeyBox
                        ?.creatorDevice.encryptionPublicKey,
                    receiverDeviceEncryptionPrivateKey:
                      context.activeDevice.encryptionPrivateKey,
                  });
                  const decryptedWorkspaceInfo = decryptWorkspaceInfo({
                    ciphertext: workspaceData.infoCiphertext,
                    nonce: workspaceData.infoNonce,
                    key: workspaceKey,
                  });
                  if (
                    decryptedWorkspaceInfo &&
                    typeof decryptedWorkspaceInfo.name === "string"
                  ) {
                    workspaceName = decryptedWorkspaceInfo.name as string;
                  }
                }
              }

              return { name: workspaceName };
            },
          }),
          type: "final",
        },

        loadWorkspaceFailed: {
          type: "final",
        },
      },
      id: "workspaceSettingsLoadWorkspaceMachine",
    },
    {
      guards: {
        hasNoNetworkErrorAndWorkspaceFound: (_, event) => {
          // @ts-ignore
          if (event.data?.error?.networkError) {
            return false;
          }
          // @ts-ignore
          if (event.data?.data?.workspace?.id) {
            return true;
          }
          return false;
        },
      },
      services: {
        fetchWorkspace,
        loadInitialDataMachine,
      },
    }
  );
