import { assign, fromPromise, setup } from "xstate";
import {
  MeWithWorkspaceLoadingInfoQuery,
  runMeWithWorkspaceLoadingInfoQuery,
} from "../../../generated/graphql";
import { getLastOpenWorkspaceId } from "../../../store/appStateStore";
import { getLastOpenDocumentId } from "../../../store/workspaceStore";

export type MeWithWorkspaceLoadingInfoQueryResult = {
  data?: MeWithWorkspaceLoadingInfoQuery;
  error?: {
    networkError?: any;
  };
};

type Input = {
  navigation: any;
};

type Context = {
  workspaceId?: string;
  documentId?: string;
  returnOtherWorkspaceIfNotFound?: boolean;
  returnOtherDocumentIfNotFound?: boolean;
  meWithWorkspaceLoadingInfoQueryResult?: MeWithWorkspaceLoadingInfoQueryResult;
  navigation: any;
};

export const rootScreenMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QCcD2qAuBlAxssYAdgHQCWEANmAMSwYCGyGA2gAwC6ioADqrKRlKpCXEAA9EAVgBMAGhABPRAA5pxAJzLlk1pOUB2Vst0A2AL5n5aTLnxEyhAApoo+WLGIVU9CKUJQAGXo6AFVYSAB1VGQAa1huehwwAEFCCAARVBwAVwBbIgwASQhqCGEwBwA3VBiKmAwg0PCIKNj4xJS0zJz8wiKINk4kEF5+QWFRCQQAFlUNZQBGdXV9AGZ9afWF5XklBBNpyWJlVdWTfQXpSR1V9XNLEGtsPAISP2dUVzgPLx8-QOCGDCkWicQSSVSGSyeQKxWoYGQaGQxG4FHoGAAZtFcsR6o0gc1WmCOpDujC+sVBqJRgIhCJhlNZmpNEsVutNhcdoopOpVsdJNMFtMNvp1AtWJsLFZ0M87G8nC43D9vL5-KVylUahUMWAMDgABYAWTAEQE+qJ7SSARV-0KhCxVOGNPG9NAU0uy2O52MrHUplYV12iBMJlYxBk6mmvoWJgM6mkUseMtsrwcHy+7k8NrVZUIFT81VqxB1eqNJrNFvBYGtf38dodCyGPD4tImDMQHvUXv0Pr9klDge5+yM4Z0ugW-eW51WiaeKfs70V3yztag8MR0RRaMx2OLuoNxtNGHNoMt1ezUHrqEdzbGdMmHeknuU3tYvv9g721xM4cMJl5KwLEK0j3NKNgvAuCqfEqK4QJA1A3iMLYug+CBLKsCzEDGWhPtMVwmJIFxBvsvLEBsrAHJswqnCcs7JhB8rpjBvxwSUzCNtSyH3u2aG8ph2GqJG+GEQsxGrKwmHTARuj9rMCy3GcdHgXKaZLpmGL0KQFDZPg1BiHQ6IVPQGIYAiAAU0hvqwACU1BzgxqnQcuGlaTpYCIc63Fuh2-4-icOhPhK0gYbcxE6NM4ZiqcJjrMF2wTkpsqpouTmZgW9AUOQWDfHSCEcJxd5tt5CCrE+Xbivosa3NINWxsRT7KMQUnSEBiyiiB1wzg89kqSlGYeJUGVZTlwh5U2SGFa64iIMFGHEMFRjGCyIbBWF0xdlcAp3GcAoUV1YFJZBTHLoNmUQNl7i5ex42eUV00ILNmELVovqLCtqzEYYYZRv2yhipZQqSIl86MWpHiEJgyTZMe0SkAAXvBHlcXdUylZ6FVVfGtVcns0ybBowogSYMZASs1zAw5fUwfgvj4DgGAACqoGSvQYGNBWtlNqNlVhrCVScWMgTjUgyBoCyVawZz-qcYoU71UH9cQ+rBAAcqglYdLA7NOsjXOIGj5V85jNVC8R-76E1AYXBJFHLKsQPdfR8vHZmyuwBrEI4Ek7ja7enOodIyh4fMLJRsseFhdcGiWQKQGrKoHpy8lCswW7HspF73wIRxOuTQHQfMn9ixh0JxF4z+6gBYc4tUX2FgPBDcHwMMPXJZQYAcyhPECmRgeV0+hGxrolXEQAtJG80hsKhzhz2eNJ0dYOwf8+LAi0p5VqS0Ks8UndefdBhm+L80tUKLLxoKCaO8pycu8qq57yjKg9sc2jGPbGELfoR8-vH7X6NIP8ckF6g1SvfVij89ZoVUBbW4MlQxvnFJIM2QdwznBAksUUAZJYgMcorFy2l8CQNQtsQBxA4HfiskgyOXZ+wyHjocFq9tcFU2XOlM6F1+B3VulA0+T0hSChkJIBh5x6obCaiGf8uhBQBmYdfQ6oDFanWGpdbhusA4xjDIYGMhw-znH0Mgoc-4nqlSuPJSQkZfosJTsuCGGAoYw2QPDSAxCeLiWkBFKSJgPG3GrjGD6Q5BRdkrtseOMgB7XGmNYu+xAaakDpozZm28CiuOKuJeSGgJQAPEsKCxYVA7RyYXjF8iw7jRKXm7NW6dm5+y7sVYSxBdDBTFJoSq3iAl7GnJbABYcPHUXUOUsBStgjp2SJndwqT7ogRHBROMBEzjiRMGtH8IpxSnH0AYjx+hBn9UmajdQxFthHGFIsIO5wAziwGfIkGezEDjzHqE+aW0DhaCFPFZQ9czBAA */
  setup({
    types: {} as {
      context: Context;
      input: Input;
    },
    guards: {
      hasNoNetworkError: ({ context, event }) => {
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
      redirectToNoWorkspaces: ({ context }) => {
        context.navigation.replace("Onboarding");
      },
      redirectToDocument: ({ context }) => {
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
          throw new Error("Failed to redirect to the document");
        }
      },
    },
    actors: {
      // TODO doesn't need to be async
      getLastUsedWorkspaceAndDocumentId: fromPromise(async ({}) => {
        const lastOpenWorkspaceId = getLastOpenWorkspaceId();

        if (lastOpenWorkspaceId) {
          const lastOpenDocumentId = getLastOpenDocumentId({
            workspaceId: lastOpenWorkspaceId,
          });
          return {
            lastOpenWorkspaceId,
            lastOpenDocumentId,
          };
        }
        return {
          lastOpenWorkspaceId,
        };
      }),
      fetchMeWithWorkspaceLoadingInfo: fromPromise(
        ({ input }: { input: Context }) => {
          return runMeWithWorkspaceLoadingInfoQuery({
            workspaceId: input.workspaceId,
            documentId: input.documentId,
            returnOtherWorkspaceIfNotFound:
              input.returnOtherWorkspaceIfNotFound,
            returnOtherDocumentIfNotFound: input.returnOtherDocumentIfNotFound,
          });
        }
      ),
    },
  }).createMachine({
    context: ({ input }) => ({
      navigation: input.navigation,
    }),
    initial: "idle",
    states: {
      idle: {
        on: {
          start: {
            target: "inProgress",
          },
        },
      },
      inProgress: {
        initial: "loadingLastUsedWorkspaceAndDocumentId",
        states: {
          loadingLastUsedWorkspaceAndDocumentId: {
            invoke: {
              src: "getLastUsedWorkspaceAndDocumentId",
              id: "getLastUsedWorkspaceAndDocumentId",
              onDone: [
                {
                  target: "loading",
                  actions: assign(({ event }) => {
                    const castedEvent = event as any;
                    return {
                      lastOpenWorkspaceId:
                        castedEvent.output.lastOpenWorkspaceId, // might be undefined
                      lastOpenDocumentId: castedEvent.output.lastOpenDocumentId, // might be undefined
                      returnOtherWorkspaceIfNotFound: true,
                      returnOtherDocumentIfNotFound: true,
                    };
                  }),
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
              input: ({ context }) => ({ ...context }),
              onDone: [
                {
                  target: "loaded",
                  guard: "hasNoNetworkError",
                  actions: assign({
                    meWithWorkspaceLoadingInfoQueryResult: ({ event }) =>
                      event.output,
                  }),
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
                target: "validSession",
                guard: "isValidSession",
              },
              {
                target: "invalidSession",
              },
            ],
          },
          failure: {
            after: {
              "2000": {
                target: "#rootScreen.inProgress.loading",
                actions: [],
                internal: false,
              },
            },
          },
          invalidSession: {
            entry: "redirectToLogin",
            type: "final",
            always: {
              target: "#rootScreen.idle",
            },
          },
          validSession: {
            always: [
              {
                target: "hasWorkspaceAccess",
                guard: "hasAccessToWorkspace",
              },
              {
                target: "hasNoWorkspaces",
              },
            ],
          },
          notAuthorized: {
            entry: "redirectToLobby",
            type: "final",
            always: {
              target: "#rootScreen.idle",
            },
          },
          redirectToDocument: {
            entry: "redirectToDocument",
            type: "final",
            always: {
              target: "#rootScreen.idle",
            },
          },
          hasNoWorkspaces: {
            entry: "redirectToNoWorkspaces",
            type: "final",
            always: {
              target: "#rootScreen.idle",
            },
          },
          hasWorkspaceAccess: {
            always: [
              {
                target: "redirectToDocument",
                guard: "isAuthorized",
              },
              {
                target: "notAuthorized",
              },
            ],
          },
        },
      },
    },
    id: "rootScreen",
  });
