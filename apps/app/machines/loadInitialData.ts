import { assign, createMachine } from "xstate";
import { MeQuery } from "../generated/graphql";
import { fetchMeWithWorkspaceLoadingInfo } from "../graphql/fetchUtils/fetchMeWithWorkspaceLoadingInfo";

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
  queryResult?: MeWithWorkspaceLoadingInfoQueryResult;
};

export const loadInitialDataMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QBsD2BDCBJAdgSwBc91kARdA9AOjUzxygGIJUcwr6A3VAa3YDMwBAMYALALJgA6oVFTUAJx6wADumFgAMhgj0oufqkSgVqWITytjIAB6IATPYCcVAAwBGABwA2AKw+nJwBmD1dvABoQAE9Eb28qewB2ABYg71dXX3cndMTEgF98yNpsfCISckoaHT1GMAUFRSoVZApDBQBbKkERCWlZeSVVdS0ahgMjJBBTcyIrKbsEd1dkqk9XRKd3ZMSsna2gyJiEZ1X3d0TvT0dfK6ygwuKdXAsKimoSyEZrGYt50EWiXWVGSYXsaScviCWShR0Qy3cIOy3khyV8iVcaW8BSKIBKL3KZHe3XQeGQAFcFGBGDZYJQCOx0PwGQoABT2DKuACUjHxZWIRKq-FJFKpPzMfxw1kWAFpvEEqMt5esclc4u44Qg0okqNj0ckDUFIfZkibHnjnvy3lVOCQ8BAAMpwcysb5TX5zKULeHueyeKjBIKedbQ33y3ya9xQkFhFbBUG+ZLy7zmvmvQXUdDkgiiRR4ABeX3Fs0sXoB8M8kIDUc8Rs8vg810jyURu1uTk2aSSftTlvTlWoonQsEGyjUGgAgsINLBYG6TBLPdL4Q37AlPO4gkmvN57L4I9F4S2qG2UZ3d4ke+acKgIHBrGnCQPqnQGMXJcuEDLsjqgvZN36gTeOcGyauiAYhNsTipBkjieMkvaYASArPp8EDvku3oIPKa5Bq49ZAiiOT2JGrhrr4Hb2N4aLOPhzieIhpT9sSwpkpSYAYaWn7yqskK+OC+y+uCESHic0JrPqaL4XklaOIxyHWtQXB2o6zpce6i7qeWCC7C41xdgafpovWmrQjquxkYkISBJsKzyVaGZULayD2k6s5adMmn-LY8Jkf68pkcEVxJp4QKaskLgrJWAXpPKm4Ibij4ocSWY5nmhboRpJbeYsFz+Lq2JbNB0GOFRzZrtcoUgRcQTZLc9nMVUN4EBO2a5goBaQJxOUrhRJ47o4RrpFRySmQaCTuMBDa1lClkpolfZPsSVKYMcC7ZWWPknNkrgnnuMEhJyl6RuJbZJJslbwZsOJPEhDnPkOsAAHKoKOwwzt1m25fWiLJPB+7YhFjhWWN8SuIElbxbu+6ZA1S1VI9b3jmAU4zvAWUflhvrBLqPiTYE6IrLs4WRX9OQhLFtVbnDyVNagqPOp9n7nLWbjQX4-i+jWThjasiRRrVjimqCSa+DTilM1hMqOIif4AZWOQgYkmrS2uwTXOi-F3Ok8GFIUQA */
  createMachine(
    {
      context: { navigation: null } as Context,
      tsTypes: {} as import("./loadInitialData.typegen").Typegen0,
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
          data: (context) => context.queryResult,
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
          type: "final",
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
          return Boolean(context.queryResult?.data?.me?.id);
        },
        hasAccessToWorkspace: (context) => {
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
        // @ts-ignore seems to be an issue with xstate type generation
        redirectToNoWorkspaceAccess: (context) => {
          context.navigation.replace("WorkspaceNotFoundScreen", {
            workspaceId:
              context.queryResult?.data?.me?.workspaceLoadingInfo?.id,
          });
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
      services: {
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
