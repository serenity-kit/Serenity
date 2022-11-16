import { assign, createMachine } from "xstate";
import {
  MeWithWorkspaceLoadingInfoQuery,
  runMeWithWorkspaceLoadingInfoQuery,
} from "../../../generated/graphql";

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

export const workspaceNotDecryptedScreenMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QHcD2AnA1rADgQwGMwA5VAFwBEwD0BPHMyAOgBtU8IBLAOygGIIqbmCY8AbqkwiAZmDIEAFgFkwAdU5kFqjNnxEAMuy68Akt2mpEoHKlgbOQqyAAeiACwAGAMxMAbACZAgFYggA4ggEZ-IIB2AE4vABoQWkR-XximOIiIt39Q-w9CmK9fNwBfcuS0LFxCEnIqGnpGCFYjHn4wdHQMJhwWPDILdABbJll5ZTUNLR06gw7Tc0skEBs7MgduJ1cECLj-JgjfLwiY33C48JLk1IQg7KZ-CLC3L0K3N1CvSur5vQNSjUOgMZhsDiQPhODb2RxrPaHNzPUI-ELeC6xGJ3RBeLyhLIRUIlYkvIJeNxxXx-EA1XT1UjA5pgtrSPCcFgAV3QYD4zlgZCGIjw0kY6AAFIUPB4AJR8OkLIFNUGtCbsrk8mG2OE7BGIAC0Xg8fhykTxUuJbkuOIQ7wiTCtMUK5NC0peviCNIVgMZypazDEeBYnAgAGU4HYhNC1rCtvDQHsosSsiV-G4iXEYjEChEbXiCdlifina8KVSvQCGY0Qf62txyABBTmaDCcABeUP5gsYTBFYvFQWlsvllaIvprLKY9bITZb6HbkC1m22u0QoUzTCN+VCdrybiCNsKRy8meyeQ8niChTiFdqPurzNVCjwsG0d-qDYIRFgsGj1m1ca6gmiDnMmqIfJEqIRF4YQHikuL4oSRakqWlLUjS9YQHATjelWTIquCSxQEuOqrgg+pOiacTkjRcRWl4tzwQgLxHNElIFDBQSnOcMS3vSY4PgRbQQlhEAkYBZE5kwrqXPk+L+BcF55nRDoeAc0GUi8PwZHxirjo+zBshy3JgOJK56vsIR+BcURcTBHgej8NpWr4TAeKEAQeNcrr7r46H-O+An4bWojcIGwZhhG5n-su8YuIg2T2oE6YnnEXk8bmTFccixInFeDmuuSun3sFk7hSG4Y-tF6wAdVia5JkeQxHuOQUniynIp46lllppS8VUtKjkqE6qtOs4KK2HZiTGtVxYmcQJFkrp0XiHzri8h6UR4MRedmfVWo8noDbhQV+pOPJcDyBBkAAKqgFCoAQnKjGA3BkGZc1pNBrlhKUV7NWcbV5jEQRZKcMH7laVKhCcxV4WdT4vm+-FgJ+37wDNsVAfFlkw88TpUpmJzfFaHWqQcjzpOEV7lsdQ36UJU6oGjEYfdjiaBKx+VZtEaVOv4NohHEzzRGc1y+Ak8RHQFKMM7WbNkfqVJUTRMF0acjH3NBxrpttfkXhTl6VJUQA */
  createMachine(
    {
      context: { navigation: null } as Context,
      tsTypes:
        {} as import("./workspaceNotDecryptedScreenMachine.typegen").Typegen0,
      predictableActionArguments: true,
      initial: "loading",
      states: {
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
              target: "noAccess",
            },
          ],
        },
        notAuthorized: {
          after: {
            "5000": {
              target: "loading",
            },
          },
        },
        redirectToDocument: {
          entry: "redirectToDocument",
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
        noAccess: {
          entry: "redirectToNotFoundOrNoWorkspaces",
          type: "final",
        },
      },
      id: "workspaceNotDecrypted",
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
        redirectToNotFoundOrNoWorkspaces: (context) => {
          if (context.returnOtherWorkspaceIfNotFound === true) {
            context.navigation.replace("Onboarding");
          } else {
            context.navigation.replace("WorkspaceNotFound", {
              workspaceId:
                context.meWithWorkspaceLoadingInfoQueryResult?.data?.me
                  ?.workspaceLoadingInfo?.id,
            });
          }
        },
        redirectToDocument: (context) => {
          if (
            context.meWithWorkspaceLoadingInfoQueryResult?.data?.me
              ?.workspaceLoadingInfo
          ) {
            context.navigation.replace("Workspace", {
              workspaceId:
                context.meWithWorkspaceLoadingInfoQueryResult.data.me
                  .workspaceLoadingInfo.id,
              screen: "WorkspaceDrawer",
              params: {
                screen: "Page",
                params: {
                  pageId:
                    context.meWithWorkspaceLoadingInfoQueryResult.data.me
                      .workspaceLoadingInfo.documentId,
                },
              },
            });
          } else {
            throw new Error("workspaceLoadingInfo was not defined");
          }
        },
      },
      services: {
        fetchMeWithWorkspaceLoadingInfo: (context) => {
          return runMeWithWorkspaceLoadingInfoQuery({
            workspaceId: context.workspaceId,
            returnOtherWorkspaceIfNotFound: false,
            returnOtherDocumentIfNotFound: true,
          });
        },
      },
    }
  );
