import { assign, createMachine } from "xstate";
import { MeWithWorkspaceLoadingInfoQuery } from "../../../generated/graphql";
import { fetchMeWithWorkspaceLoadingInfo } from "../../../graphql/fetchUtils/fetchMeWithWorkspaceLoadingInfo";
import {
  getLastUsedDocumentId,
  getLastUsedWorkspaceId,
} from "../../../utils/lastUsedWorkspaceAndDocumentStore/lastUsedWorkspaceAndDocumentStore";

export type MeWithWorkspaceLoadingInfoQueryResult = {
  data?: MeWithWorkspaceLoadingInfoQuery;
  error?: {
    networkError?: any;
  };
};

type Context = {
  workspaceId?: string;
  documentId?: string;
  returnOtherWorkspaceIfNotFound?: boolean;
  returnOtherDocumentIfNotFound?: boolean;
  navigation: any;
  meWithWorkspaceLoadingInfoQueryResult?: MeWithWorkspaceLoadingInfoQueryResult;
};

export const rootScreenMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QCcD2qAuBlAxssYAdgHQA2qAhhAJaFQAyFsGAqrJAOqrIDWsADhRxgAgoQgARVDgCuAWyIYAkhADEEVITDFaAN1Q9tMDI2ZtO3PoOFjJ0+YpWJQ-VLGoZqm5yAAeiAFoAJgAOAHZiAE4wgFYgyIAWWIBGSJCAZjCAGhAAT0RkjOIgsISANhCQmLKY5IAGcIBfRpy0TFx8IjJKGjpTVnYILl4BIVFxKVkFQmU1MGQ0ZGJ+UgoMADNuOWJjfvMhy1GbCftp2Z9Xd09vJD9A2OI4kLK6srCwiqC6hKCc-IR6nViOlImUavEykEYmlkulmq10Ng8AQSOQqLQoOpNNo9AZtOswBgcAALACyYA4HmJwysY3oPQxSkImwubg8XkIPn8CCC6WSjyhH15IR+tTKfwKkSBYO+VXi6QqVTC8JAbSRnVRDLoqnmi2Wqw2W2IBKJZIpVJpRzA9PRdCZLNul3ZN1A3JKQUeCWiNRCkV5dQaMQlCASP0eCoD5TqMVqYV5KrVHRR3SokFUrKuHK5iEqMWIdXSz1eLyCkLqkWDJUiUQVtRiRbSlQTiKTXXWFGopBk+FUvmYa20FHWGHmAAovgGAJSqRPItsdrv4DPOzm3bkx9LEEL1MoJAPVd51ZLBmLpIEgjcwsqF5LJZvtOckXQUUjUCBYODuTTpx1s66r10CniCJonSM8ymSUsqlSSswmrSJayCVIgniANSnvdVk2JJhLWsUQcGEWBYB-Fw-yzNcCjgiJKnSL4pV9Wj3lg+DEOQ1C6nQlVCFQCA4B8WcNRTXoGCYAYLBGPDbEmBwZicX9MxdO4EGCFD82SKjvhqQpYWDAIymrII93KUJwjg+o7xaVUW0fISMWXf9s2UlCPSPOD4iSEpA2DQsEmBDJQTCPkz1KGMMNbTVUwgezyMAhA4xCKIEjPX1IK9PdjzyRASk3BCXjCDJ0j3WiLIRB9BPbTtuzAaLFO5UpNxFBJ1MaoKSmDH5+XCcCvlCJI-TCmy9BfN8PyImKQCdByKIBeo82qGpImSGJXkM35MoQJ580KhVGzCI8YgSAbBOfV930-cbJvG7lb15fM3kM+r0mqbdvKhKIUJBZIkr9X1DssgTk24jARBkDBiW4agAC9IBqgClNSL1iFhcF5ShKoTwVLdd3iXkkjPJ6juTfAaHwHAMAAFVQaSzlhxzCjeR4YliBJluvA7snW28ymIa9r2eUMIMKTJCa6bDYAAOVQXCxngeSVzpr0IjBJrakiVmQXSE9Qi276y1Ccs4X+6zBLF6WbAIz9aempbFuKONohum8fm8p7iCa6IjylKFCwJo2ypRK3YoCPl+WiOJEhSNJMl0r7+RQj5Yg4t5Cn65pGiAA */
  createMachine(
    {
      context: { navigation: null } as Context,
      tsTypes: {} as import("./rootScreenMachine.typegen").Typegen0,
      predictableActionArguments: true,
      initial: "loadingLastUsedWorkspaceAndDocumentId",
      states: {
        loadingLastUsedWorkspaceAndDocumentId: {
          invoke: {
            src: "getLastUsedWorkspaceAndDocumentId",
            id: "getLastUsedWorkspaceAndDocumentId",
            onDone: [
              {
                actions: assign((_, event) => {
                  return {
                    lastUsedWorkspaceId: event.data.lastUsedWorkspaceId, // might be undefined
                    lastUsedDocumentId: event.data.lastUsedDocumentId, // might be undefined
                    returnOtherWorkspaceIfNotFound: true,
                    returnOtherDocumentIfNotFound: true,
                  };
                }),
                target: "loading",
              },
            ],
            onError: [
              {
                target: "loading",
              },
            ],
          },
        },
        loading: {
          invoke: {
            src: "fetchMeWithWorkspaceLoadingInfo",
            id: "fetchMeWithWorkspaceLoadingInfo",
            onDone: [
              {
                actions: assign({
                  meWithWorkspaceLoadingInfoQueryResult: (_, event) =>
                    event.data,
                }),
                cond: "hasNoNetworkError",
                target: "loaded",
              },
              {
                target: "failure",
              },
            ],
            onError: [
              {
                target: "failure",
              },
            ],
          },
        },
        loaded: {
          always: [
            {
              cond: "isValidSession",
              target: "validSession",
            },
            {
              target: "invalidSession",
            },
          ],
        },
        failure: {
          after: {
            "2000": {
              target: "loading",
            },
          },
        },
        invalidSession: {
          entry: "redirectToLogin",
          type: "final",
        },
        validSession: {
          always: [
            {
              cond: "hasAccessToWorkspace",
              target: "hasWorkspaceAccess",
            },
            {
              target: "hasNoWorkspaces",
            },
          ],
        },
        notAuthorized: {
          entry: "redirectToLobby",
          type: "final",
        },
        redirectToDocument: {
          entry: "redirectToDocument",
          type: "final",
        },
        hasNoWorkspaces: {
          entry: "redirectToNoWorkspaces",
          type: "final",
        },
        hasWorkspaceAccess: {
          always: [
            {
              cond: "isAuthorized",
              target: "redirectToDocument",
            },
            {
              target: "notAuthorized",
            },
          ],
        },
      },
      id: "rootScreen",
    },
    {
      guards: {
        // @ts-ignore need to properly type this event
        hasNoNetworkError: (context, event: { data: QueryResult }) => {
          return !event.data?.error?.networkError;
        },
        isValidSession: (context) => {
          return Boolean(
            context.meWithWorkspaceLoadingInfoQueryResult?.data?.me?.id
          );
        },
        hasAccessToWorkspace: (context) => {
          return Boolean(
            context.meWithWorkspaceLoadingInfoQueryResult?.data?.me
              ?.workspaceLoadingInfo?.id
          );
        },
        isAuthorized: (context) => {
          return Boolean(
            context.meWithWorkspaceLoadingInfoQueryResult?.data?.me
              ?.workspaceLoadingInfo?.isAuthorized
          );
        },
      },
      actions: {
        redirectToLogin: (context) => {
          context.navigation.replace("Login", {});
        },
        redirectToLobby: (context) => {
          context.navigation.replace("Workspace", {
            workspaceId:
              context.meWithWorkspaceLoadingInfoQueryResult?.data?.me
                ?.workspaceLoadingInfo?.id,
            screen: "WorkspaceNotDecrypted",
          });
        },
        redirectToNoWorkspaces: (context) => {
          context.navigation.replace("Onboarding");
        },
        redirectToDocument: (context) => {
          if (
            context.meWithWorkspaceLoadingInfoQueryResult?.data?.me
              ?.workspaceLoadingInfo
          ) {
            context.navigation.replace("Workspace", {
              workspaceId:
                context.meWithWorkspaceLoadingInfoQueryResult?.data.me
                  .workspaceLoadingInfo.id,
              screen: "Page",
              params: {
                pageId:
                  context.meWithWorkspaceLoadingInfoQueryResult?.data.me
                    .workspaceLoadingInfo.documentId,
              },
            });
          } else {
            throw new Error("Failed to redirect to the document");
          }
        },
      },
      services: {
        getLastUsedWorkspaceAndDocumentId: async (context) => {
          const lastUsedWorkspaceId = await getLastUsedWorkspaceId();
          if (lastUsedWorkspaceId) {
            const lastUsedDocumentId = await getLastUsedDocumentId(
              lastUsedWorkspaceId
            );
            return {
              lastUsedWorkspaceId,
              lastUsedDocumentId,
            };
          }
          return {
            lastUsedWorkspaceId,
          };
        },
        fetchMeWithWorkspaceLoadingInfo: (context) => {
          return fetchMeWithWorkspaceLoadingInfo({
            workspaceId: context.workspaceId,
            documentId: context.documentId,
            returnOtherWorkspaceIfNotFound:
              context.returnOtherWorkspaceIfNotFound,
            returnOtherDocumentIfNotFound:
              context.returnOtherDocumentIfNotFound,
          });
        },
      },
    }
  );
