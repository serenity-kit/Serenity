import { assign, createMachine } from "xstate";
import { MeDocument, MeQuery, MeQueryVariables } from "../generated/graphql";
import { urqlClient } from "../utils/urqlClient/urqlClient";

type QueryResult = {
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
  queryResult?: QueryResult;
};

const fetchMeWithWorkspaceLoadingInfo = async (context) => {
  console.log("fetchMeWithWorkspaceLoadingInfo");
  await new Promise((r) => setTimeout(r, 2000));
  const result = await urqlClient
    .query<MeQuery, MeQueryVariables>(
      MeDocument,
      {
        workspaceId: context.workspaceId,
        documentId: context.documentId,
        returnOtherWorkspaceIfNotFound: context.returnOtherWorkspaceIfNotFound,
        returnOtherDocumentIfNotFound: context.returnOtherDocumentIfNotFound,
      },
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
      }
    )
    .toPromise();
  return result;
};

export const loadInitialDataMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QBsD2BDCBJAdgSwBc91kARdA9AOjUzxygGIJUcwr6A3VAa3YDMwBAMYALALQBbMAHVComagBOPWAAd0wsABkMEelFz9UiUGtSxCeVqZAAPRACYAzAEYqAdg8AOAJzfvD2c3ABZHVwAaEABPRHEABipXeMcw3w8AVlcMgDYsnNdXAF8iqNpsfCISckoaPQNGMCUlZSo1ZApjJUkqQREJaTkCBWVVDS1dOgYjEyQQc0siGzmHBHDvKj9nP29HDN9972co2LXvDKp473jfR3jnK-j4kJKyvVwraopqcshGWwWVmWoFWPkSIXiORcOQOziyGWOMUQyXcIVcvhhGRCGQ89xyOQ8rxA5Q+VTI3166DwyAArkowIw7LBKAR2Oh+KylAAKO5PACUjBJlWI5Nq-CptPpAIsQJwtlWzl8lxCeRCHlceTuWL2J0QzghVAJjkc6Tc9yuGSJQs+ouonBIeAgAGU4JZWP85oClnKVsjXI4Nr5ggF7llHDk4bqENlnFQITlnkGIViIzkre9hV9augacNlHgAF5-aWLaw+kHIvwXXzZI7+DLxVy7KOuNGeDK5dJBqEeAPpzCkkU1aiidCwRQqdSaMAAQWEWlgsA9Zhl3vlyIbjioAdc+oK3ihHZbbcynY83ccve8JVKIBwqAgcFs1rJw7qUygJdl64Q8Sj+yoXwgKAtw9kvFxr1vF8hwpX4IC-NdfQQCMt22C0fBhDFHBbFIqH2XscmxE0rhNSC3gHTNbUpak6TABCyx-CMQkAjsXDVGtjWcHIoxcC5zg8EJsSuLw-GNfsKhtN8uAdZ1XQYz1V3kisEEyJVdi41Iwm8bFzijOEPHbFIghuLtnnEwcsztGSXUXJT5kU4F7GRFINgjFJu20nJAm8KMQiVZ4-DchMI13F4oIzSSKRzPMlELSB6Mc1ZXEyVyCRrXw-LCY1uKRaMwk2AN1RRIJ0VyczKLfe8CBnXNRHzIt4IU0tEuRIjt32G5zhxS9I1yvdLiAvxQsPBtLXCijItqelMFOFdmvLJy1nRRJeyxB4HieeJexbOF2wyS9zx2djCXGiTXwpUdYAAOVQCcxmneAmu-JCmyyONtI7Ak-ONII9JVAb-BrPc9lG8rJpHMc7qnLQ5wXR65ue5T-SDQ0Dw1ICcWeTJfP8kJAoeYK3H1MHztqe9YddBKFqSptYxuFUO28f1a18P7mPVBF-VSVJnjyEmYMoKmf3EVIo3EXtLkC7FnDufV4gySCSiAA */
  createMachine(
    {
      context: { navigation: null } as Context,
      tsTypes: {} as import("./loadInitialData.typegen").Typegen0,
      predictableActionArguments: true,
      initial: "loading",
      states: {
        loading: {
          invoke: {
            src: async (context) => {
              console.log("fetchMeWithWorkspaceLoadingInfo");
              await new Promise((r) => setTimeout(r, 2000));
              const result = await urqlClient
                .query<MeQuery, MeQueryVariables>(
                  MeDocument,
                  {
                    workspaceId: context.workspaceId,
                    documentId: context.documentId,
                    returnOtherWorkspaceIfNotFound:
                      context.returnOtherWorkspaceIfNotFound,
                    returnOtherDocumentIfNotFound:
                      context.returnOtherDocumentIfNotFound,
                  },
                  {
                    // better to be safe here and always refetch
                    requestPolicy: "network-only",
                  }
                )
                .toPromise();
              return result;
            },
            id: "fetch-meWithWorkspaceLoadingInfo",
            onDone: [
              {
                actions: assign({
                  queryResult: (_, event) => event.data,
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
              target: "hasWorkspaceAccess",
            },
          ],
        },
        authorized: {
          always: [
            {
              cond: "hasAnyWorkspaces",
              target: "ready",
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
        ready: {
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
              target: "authorized",
            },
            {
              target: "notAuthorized",
            },
          ],
        },
        noAccess: {
          entry: "redirectToNoWorkspaceAccess",
        },
      },
      id: "loadInitialData",
    },
    {
      guards: {
        // @ts-ignore TODO
        hasNoNetworkError: (context, event: { data: QueryResult }) => {
          return !event.data?.error?.networkError;
        },
        isValidSession: (context) => {
          return Boolean(context.queryResult?.data?.me?.id);
        },
        hasAccessToWorkspace: (context, event: { data: QueryResult }) => {
          return Boolean(
            context.queryResult?.data?.me?.workspaceLoadingInfo?.id
          );
        },
        isAuthorized: (context) => {
          return Boolean(
            context.queryResult?.data?.me?.workspaceLoadingInfo?.isAuthorized
          );
        },
        hasAnyWorkspaces: (context) => {
          return true;
        },
      },
      actions: {
        redirectToLogin: (context) => {
          context.navigation.replace("Login", {});
        },
        hasAccessToNoWorkspaceAccess: (context) => {
          // TODO create page for this case and redirect to it here
          // context.navigation.replace("NoWorkspaceAccess", {});
          return false;
        },
        redirectToLobby: (context) => {
          context.navigation.replace("WorkspaceNotDecrypted", {
            workspaceId:
              context.queryResult?.data?.me?.workspaceLoadingInfo?.id,
          });
        },
        redirectToNoWorkspaces: (context) => {
          context.navigation.replace("Onboarding");
        },
      },
    }
  );
