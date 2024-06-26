import { assign, fromPromise, setup } from "xstate";
import {
  MeWithWorkspaceLoadingInfoQuery,
  runMeWithWorkspaceLoadingInfoQuery,
} from "../generated/graphql";

export type MeWithWorkspaceLoadingInfoQueryResult = {
  data?: MeWithWorkspaceLoadingInfoQuery;
  error?: {
    networkError?: any;
  };
};

type Input = {
  workspaceId?: string;
  documentId?: string;
  returnOtherWorkspaceIfNotFound?: boolean;
  returnOtherDocumentIfNotFound?: boolean;
  navigation: any;
};

type Context = {
  workspaceId?: string;
  documentId?: string;
  returnOtherWorkspaceIfNotFound?: boolean;
  returnOtherDocumentIfNotFound?: boolean;
  navigation: any;
  meWithWorkspaceLoadingInfoQueryResult?: MeWithWorkspaceLoadingInfoQueryResult;
};

export const loadInitialDataMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QBsD2BDCBJAdgSwBc91kARdA9AOjUzxygGIJUcwr6A3VAa3YDMwBAMYALALJgA6oVFTUAJx6wADumFgAMhgj0oufqkSgVqWITytjIAB6IATPYCcVAAwBGABwA2AKw+nJwBmD1dvABoQAE9Eb28qewB2ABYg71dXX3cndMTEgF98yNpsfCISckoaHT1GMAUFRSoVZApDBQBbKkERCWlZeSVVdS0ahgMjJBBTcyIrKbsEd1dkqk9XRKd3ZMSsna2gyJiEZ1X3d0TvT0dfK6ygwuKdXAsKimoSyEZrGYt50EWiXWVGSYXsaScviCWShR0Qy3cIOy3khyV8iVcaW8BSKIBKL3KZHe3XQeGQAFcFGBGDZYJQCOx0PwGQoABT2DKuACUjHxZWIRKq-FJFKpPzMfxw1kWAFpvEEqMt5esclc4u44Qg0okqNj0ckDUFIfZkibHnjnvy3lVOCQ8BAAMpwcysb5TX5zKULeHueyeKjBIKedbQ33y3ya9xQkFhFbBUG+ZLy7zmvmvQXUUToWCDZRqDQAQWEGlgsDdJglnul8N8rnsCU87iCSa83nsvgj0XhyURu1uTk2aSSfsKuJwqAgcGsacJlQ+Yyg4tmli9AMQMuyOqC9ibfsC3nOG016IDIW2TlSGUcnmSqct6bn1UwkCXkurCHl9aDrk86ICOXsSM6yoXwB3sbw0WcH9nE8O9MAJAVH2FMlKTAV8q29D9mwDDtwX2X1wQiLsTmhNZ9TRH88k8JxHDg0oH2JLg7UdZ0V3QtjMN2FxriHA0-TRX9NWhHVdjrRIQkCTYVjohDrWoW1kHtJ1Sw4itl3+Wx4Trf15TrYIriTTwgU1ZIXBWajdPSeUm1vXEZ0Q4lxwIAtyQIURFDwAAvF93UrVTNKWfxEW3dZrlC2t-CEg0qESKNwQ7OJTSCNIZKtDMqCpTBjjUt9MK8aKdzwiLEg5DtNRvGLgkomidjCC9UoYqosxzRQ8xGIsS3gXz1NXAKmwgmL-Eg2La3y49fF1CEIOyX0Bw8BrZ0c1AOuddiNMWZZgVBVIoTRbEd0OYjhMGsSJIHJxpLs+9FsoNbetlRxgoOvcckPRJNRlRxT2uXxnF0rIgVHfIgA */
  setup({
    types: {} as {
      context: Context;
      input: Input;
    },
    guards: {
      hasNoNetworkError: ({ event }) => {
        return !event.data?.error?.networkError;
      },
      isValidSession: ({ context }) => {
        return Boolean(
          context.meWithWorkspaceLoadingInfoQueryResult?.data?.me?.id
        );
      },
      hasAccessToWorkspace: ({ context }) => {
        return Boolean(
          context.meWithWorkspaceLoadingInfoQueryResult?.data?.me
            ?.workspaceLoadingInfo?.id
        );
      },
      isAuthorized: ({ context }) => {
        return Boolean(
          context.meWithWorkspaceLoadingInfoQueryResult?.data?.me
            ?.workspaceLoadingInfo?.isAuthorized
        );
      },
    },
    actions: {
      redirectToLogin: ({ context }) => {
        context.navigation.replace("Login", {});
      },
      redirectToNotFoundOrNoWorkspaces: ({ context }) => {
        if (context.returnOtherWorkspaceIfNotFound === true) {
          context.navigation.replace("Onboarding");
        } else {
          context.navigation.replace("WorkspaceNotFound", {
            workspaceId: context.workspaceId,
          });
        }
      },
      redirectToLobby: ({ context }) => {
        context.navigation.replace("Workspace", {
          workspaceId:
            context.meWithWorkspaceLoadingInfoQueryResult?.data?.me
              ?.workspaceLoadingInfo?.id,
          screen: "WorkspaceDrawer",
          params: {
            screen: "WorkspaceNotDecrypted",
          },
        });
      },
    },
    actors: {
      fetchMeWithWorkspaceLoadingInfo: fromPromise(
        ({ input: context }: { input: Context }) => {
          return runMeWithWorkspaceLoadingInfoQuery({
            workspaceId: context.workspaceId,
            documentId: context.documentId,
            returnOtherWorkspaceIfNotFound:
              context.returnOtherWorkspaceIfNotFound,
            returnOtherDocumentIfNotFound:
              context.returnOtherDocumentIfNotFound,
          });
        }
      ),
    },
  }).createMachine({
    context: ({ input }) => ({
      workspaceId: input.workspaceId,
      documentId: input.documentId,
      returnOtherWorkspaceIfNotFound: input.returnOtherWorkspaceIfNotFound,
      returnOtherDocumentIfNotFound: input.returnOtherDocumentIfNotFound,
      navigation: input.navigation,
    }),
    initial: "loading",
    states: {
      loading: {
        invoke: {
          src: "fetchMeWithWorkspaceLoadingInfo",
          id: "fetchMeWithWorkspaceLoadingInfo",
          input: ({ context }) => {
            return context;
          },
          onDone: [
            {
              actions: assign({
                meWithWorkspaceLoadingInfoQueryResult: ({ event }) =>
                  event.output,
              }),
              guard: "hasNoNetworkError",
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
            guard: "isValidSession",
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
            guard: "hasAccessToWorkspace",
            target: "hasWorkspaceAccess",
          },
          {
            target: "noAccess",
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
      hasWorkspaceAccess: {
        always: [
          {
            guard: "isAuthorized",
            target: "ready",
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
    id: "loadInitialData",
    output: ({ context }) => {
      return context.meWithWorkspaceLoadingInfoQueryResult;
    },
  });
