import { assign, createMachine } from "xstate";
import { MeQuery } from "../../../generated/graphql";
import { fetchMeWithWorkspaceLoadingInfo } from "../../../graphql/fetchUtils/fetchMeWithWorkspaceLoadingInfo";
import {
  getLastUsedDocumentId,
  getLastUsedWorkspaceId,
} from "../../../utils/lastUsedWorkspaceAndDocumentStore/lastUsedWorkspaceAndDocumentStore";

export type MeWithWorkspaceLoadingInfoQueryResult = {
  data?: MeQuery;
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
  /** @xstate-layout N4IgpgJg5mDOIC5QBsD2BDCBJAdgSwBc91kARdA9AOjUzxygBl1YCBVWSAdVQCcBrWAAd0AYzABBHBFKpRAVwC2YHASwQAxBFQ4wVegDdU-PTALNWHbn0EjxUmXKUq1ERKCGpYhPDvcgAD0QAWgAmAA4AdioATkiAVlCYgBYEgEYY8IBmSIAaEABPRDTsqlDI5IA2cPD4yvi0gAYogF8W-NpsfCISckoaDAh6JhZ2TggeAWExSWlZBWVVdQ0wXl4+KiFkCgAzPkUqMwsx6ym7WccFl3V-T28iPyRAkISqRPDKxsrIyOrQxuSoXyRQQTUaVCyMUq9SSlVC8UyaSybQ6g1wPl6FGonWGWh0ekMxj0OzABFEAAsALJgLiEcmTWwzRiDYa4Pa3Lw+R6gIIIUJZNJveG-fnhQENSrA4oxcHQgG1JJZaq1SIokCddE9MhYgZ0BgrNYbLa7fZUElkqk0ukM6biZl6qBs1Ac+6+HD+XnlUJvZJxerhGL8xrNeJShDJQFvJXBqqNeINSL8tUa7rEbX9TqQDQurnup68mrxKiNLIfL6fUJwxoxMPlGKxJUNeJlzI1ZNo1OY-o7dB4ZDyXhgDQBVgUPToHYEVYACn+wYAlBoUxj09Qe32B2Acw88zzEPGslRwk1Kslg3Ufo00mH4llwZCD4jKqW0ml25hNWm+tQDCQ8BAAGU4G8HRsyeO5cw9YokmiOIsjvSo0krWoMlrSJ6xiRtQgyUIkmDCp3y6FdvyockWBtc4JFEcRYFgMCPE5HcoNBdDohqLJ-hlAMOJ+NCMKwnC8MaAi1RwVAIDgfxly1EicQYY4rAmGxbQueZnCWNxwMYt1mLCXDizSViAXqEokTDYJKnrUIzyqCIonQpo33adUO2InU5KgbcdPzEJcO9K90KSVJyhDMNS2SCFsihSIBTvCp40Iz8u2xQZIC87lngQRNwliZI7wDJDfTPa9CkQcpD0wz5ImyLIzw4pzUQ-TtVzNXt+0HdLd0yipDzFZJDL62LyjDQFBSiBD-giVJA0S5qSMMP9AOA7yGNdDLeVfOM3mhBE0niL5rKBUqEHeYtaqVVtIiveJklmtz+l-ZB-yA2iVpACCmJ80EkMPL5E1SPKsjqY8wvhWJcMhNI8sDANbuc6Svx1MSCAkeQCHJPg8AALzSrS1q6jaUnrJEYUVeFahvJUj1PJJ+VSO8gbumSdUHIZB1EAgABVUDUxYCE65iSm+N54gSZJ9ufG68mO19KioZ9nw+CNEJKHImcR-oyNgAA5VAKJmeA8cgr6obieXTz2jIJchLIbwiM7oarCJq2ReHXOZzXyOUyjqOAgWTd2spEziV9RSho6QXgot+riK8ZXhUtGbdpr7vQf29wQYIBUFOJEhSdJMhycyocFXDfmywMS2fVU2haIA */
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
      id: "loadInitialData",
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
          context.navigation.replace("WorkspaceNotDecrypted", {
            workspaceId:
              context.meWithWorkspaceLoadingInfoQueryResult?.data?.me
                ?.workspaceLoadingInfo?.id,
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
