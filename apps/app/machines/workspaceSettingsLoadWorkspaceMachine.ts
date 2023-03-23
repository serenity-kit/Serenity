import { LocalDevice } from "@serenity-tools/common";
import { assign, createMachine } from "xstate";
import {
  WorkspaceDocument,
  WorkspaceQuery,
  WorkspaceQueryVariables,
} from "../generated/graphql";
import { getUrqlClient } from "../utils/urqlClient/urqlClient";
import {
  loadInitialDataMachine,
  MeWithWorkspaceLoadingInfoQueryResult,
} from "./loadInitialData";

export type WorkspaceQueryResult = {
  data?: WorkspaceQuery;
  error?: {
    networkError?: any;
  };
};

type Context = {
  workspaceId?: string;
  navigation: any;
  activeDevice: LocalDevice;
  meWithWorkspaceLoadingInfoQueryResult?: MeWithWorkspaceLoadingInfoQueryResult;
  workspaceQueryResult?: WorkspaceQueryResult;
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
  /** @xstate-layout N4IgpgJg5mDOIC5QBsD2BDCB1VAnA1rAA7oDGYAymAC7UCWAdlLAHRqaNQCSDd16yACLp+AYgioGYFowBuqfNPYQefOgOH8AsmQAWjMIlBFUsNZKMgAHogDMABgCMLABwB2ey9sAWRwCYATjd3ADYAGhAAT0RHFxCWAIBWFyC-EJdvYNtsgF8ciOUcAmIyShp6JlZlTlV+IRF0UTBcXDwWImQRADM8AFs2DBVeeg0GnVJ9KUsTM3oLJGsYtz8E+z8UkLcAwM90iOiEbMSWXwCXQL9bEN8Q+288gsGiwhJyKlpOKqe8F9LxSWkcgU0i6NAmzxK5GmpnMDEsNgQSRW3gCISSATutkc132iBSCXcfkcjm8iVufns9hCDxAhR+kLKH0qA0wENeYCaLTaHW6fRYoOo4Pp7Ohszo81ACLO8VsiVsGUSbl8aRCiVxhzczjcyxJIXSbj1yTy+RADFQEDgljpxXZ7wqzBZEBqw1G-FFsPheJWV1JDhCfkVqNs6sciWOqLccsSd0pxO8Lhp1t+b3Kn0dbNK7rmcIWCLJARYDgD-jcVyyARDYYSmyjMacJITJqTDLtaebtoArqRyLB4AsZh7czErsdbAaDajFY5S+EojFridrok-N4qXqI4nvjbSq3me3SgAxdB0ZCQLPinOS4eqwvjtGqzUz9UXBJ+bWJUnJf25Jtb5OM+0+2MGFs09BBkkLJc-QDLYQj9EMXBYSlKSxFFZXcbZjRyIA */
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
          type: "final",
        },
        loadWorkspaceFailed: {
          type: "final",
        },
      },
      id: "loadWorkspaceSettings",
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
