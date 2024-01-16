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
import { getLocalOrLoadRemoteWorkspaceMemberDevicesProofQueryByHash } from "../store/workspaceMemberDevicesProofStore";
import { isValidDeviceSigningPublicKey } from "../utils/isValidDeviceSigningPublicKey/isValidDeviceSigningPublicKey";
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
  avatar?: string; // base64 URI
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

const fetchWorkspaceAndDecryptInfo = async (context) => {
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

  let workspaceName = "";
  let workspaceAvatar: string | undefined;

  if (result?.data?.workspace) {
    const workspaceData = result.data.workspace;

    if (
      workspaceData.infoCiphertext &&
      workspaceData.infoNonce &&
      workspaceData.infoWorkspaceKey?.workspaceKeyBox
    ) {
      const workspaceMemberDevicesProof =
        await getLocalOrLoadRemoteWorkspaceMemberDevicesProofQueryByHash({
          workspaceId: workspaceData.id,
          hash: workspaceData.infoWorkspaceMemberDevicesProofHash,
        });
      if (!workspaceMemberDevicesProof) {
        throw new Error("workspaceMemberDevicesProof not found");
      }

      const isValid = isValidDeviceSigningPublicKey({
        signingPublicKey: workspaceData.infoCreatorDeviceSigningPublicKey,
        workspaceMemberDevicesProofEntry: workspaceMemberDevicesProof,
        workspaceId: workspaceData.id,
        minimumRole: "ADMIN",
      });
      if (!isValid) {
        throw new Error(
          "Invalid signing public key for the workspaceMemberDevicesProof for decryptWorkspaceInfo"
        );
      }

      const workspaceKey = decryptWorkspaceKey({
        ciphertext: workspaceData.infoWorkspaceKey?.workspaceKeyBox?.ciphertext,
        nonce: workspaceData.infoWorkspaceKey?.workspaceKeyBox?.nonce,
        creatorDeviceEncryptionPublicKey:
          workspaceData.infoWorkspaceKey?.workspaceKeyBox?.creatorDevice
            .encryptionPublicKey,
        receiverDeviceEncryptionPrivateKey:
          context.activeDevice.encryptionPrivateKey,
        workspaceKeyId: workspaceData.infoWorkspaceKey?.id,
        workspaceId: context.workspaceId,
      });
      const decryptedWorkspaceInfo = decryptWorkspaceInfo({
        ciphertext: workspaceData.infoCiphertext,
        nonce: workspaceData.infoNonce,
        key: workspaceKey,
        signature: workspaceData.infoSignature,
        workspaceId: workspaceData.id,
        workspaceKeyId: workspaceData.infoWorkspaceKey.id,
        workspaceMemberDevicesProof: workspaceMemberDevicesProof.proof,
        creatorDeviceSigningPublicKey:
          workspaceData.infoCreatorDeviceSigningPublicKey,
      });
      if (
        decryptedWorkspaceInfo &&
        typeof decryptedWorkspaceInfo.name === "string"
      ) {
        workspaceName = decryptedWorkspaceInfo.name as string;
      }
      if (
        decryptedWorkspaceInfo &&
        typeof decryptedWorkspaceInfo.avatar === "string"
      ) {
        workspaceAvatar = decryptedWorkspaceInfo.avatar as string;
      }
    }
  }

  return { name: workspaceName, avatar: workspaceAvatar, result };
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
            src: "fetchWorkspaceAndDecryptInfo",
            id: "fetchWorkspaceAndDecryptInfo",
            onDone: [
              {
                actions: assign({
                  workspaceQueryResult: (_, event) => event.data.result,
                  workspaceInfo: (_, event) => {
                    return {
                      name: event.data.name,
                      avatar: event.data.avatar,
                    };
                  },
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
                  ?.currentWorkspaceKey?.workspaceKeyBox &&
                context.workspaceId
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
                  workspaceId: context.workspaceId,
                  workspaceKeyId:
                    context.workspaceQueryResult.data.workspace
                      .currentWorkspaceKey.id,
                });
                return {
                  id: context.workspaceQueryResult.data.workspace
                    .currentWorkspaceKey.id,
                  key: workspaceKey,
                };
              }
              return undefined;
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
          if (event.data?.result?.error?.networkError) {
            return false;
          }
          // @ts-ignore
          if (event.data?.result?.data?.workspace?.id) {
            return true;
          }
          return false;
        },
      },
      services: {
        fetchWorkspaceAndDecryptInfo,
        loadInitialDataMachine,
      },
    }
  );
