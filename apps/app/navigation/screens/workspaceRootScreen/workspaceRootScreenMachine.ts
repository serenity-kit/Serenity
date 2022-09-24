import { assign, createMachine } from "xstate";
import {
  loadInitialDataMachine,
  MeWithWorkspaceLoadingInfoQueryResult,
} from "../../../machines/loadInitialData";
import { getLastUsedDocumentId } from "../../../utils/lastUsedWorkspaceAndDocumentStore/lastUsedWorkspaceAndDocumentStore";

type Context = {
  workspaceId: string;
  navigation: any;
  lastUsedDocumentId?: string;
  meWithWorkspaceLoadingInfoQueryResult: MeWithWorkspaceLoadingInfoQueryResult;
};

export const workspaceRootScreenMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QBsD2BDCAFdMB0amAlgHZQCSJRALusgCLq0DEEqJYepAbqgNadCESjSJ1GtALLoAxgAtSYRKAAOqWKPbKQAD0QAmAJwAGPAGYALAA59N4zYtmAbPoA0IAJ6IAjPv15DfTMAVmsnYNCzM28LAF9Y9yEcfCFSCipaBiZ0ZjAAJzzUPLwVZCYAMyKAWwIMYQyxLKlZBQ5tNQ1qIi0kXUQrAHYAqxCrUKsLJ0cBs3cvBDN9Jzxg4wtI-QHNifjEuuTBOoAZdFhqAFVYSHpUGQBXKrASanIIVnZOHn5DzAPazBOZ0u11uDyeLwgCC+MiY3RIAG1jABddrqTQkbR6BAAWiMpgs3mMTicxkMg2MwX0Fgscx8JLwxkJxmMVMWVicEysuxASVwPwggIuVwgN3uj2er1yBSKJTK1EqeRqvJSx1OQpBYvBryhJF4MK67ERKN6HXRmMQuJG5jMAxJ9iCNoGE1pCH0wTMeAsA0CwUMZhM3m8Vgp8QSIBIqAgcG0yv5aREmQk6FRnTh5oQ3g91OsVl8WwG3i2bpdvisKyDwQGq0GhbMLO5sbweUgRGbMmoABVUKKwc8U2belinIs8GNBhYiVYpxyaZ46d4VoYCcTrNTghMBg39nz-gK1cCRaDxRD+waMYOLeFgit-VZAlXguEoiXbOWxlX7AWZiGw42Iz3j1gABBbh0CIMoACNkCUE00TPdNhwsFZvXsYdA29SkXUWQxPUJAYLCCMlfW8Jct1+PlTzTC8cScb0bzJe8IifWY5wQVYAmcf0SLJQt8P0UNYiAA */
  createMachine(
    {
      context: { navigation: null } as Context,
      tsTypes: {} as import("./workspaceRootScreenMachine.typegen").Typegen0,
      predictableActionArguments: true,
      initial: "loadLastUsedDocumentId",
      states: {
        loadingInitalData: {
          invoke: {
            src: loadInitialDataMachine,
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
                actions: assign({
                  meWithWorkspaceLoadingInfoQueryResult: (_, event) => {
                    return event.data;
                  },
                }),
                cond: "hasDocumentId",
                target: "redirectToDocument",
              },
              {
                target: "noDocumentsAvailable",
              },
            ],
            onError: [{}],
          },
        },
        redirectToDocument: {
          entry: "redirectToDocument",
          type: "final",
        },
        loadLastUsedDocumentId: {
          invoke: {
            src: "getLastUsedDocumentId",
            onDone: [
              {
                actions: assign({
                  lastUsedDocumentId: (_, event) => {
                    console.log("lastUsedDocumentId", event.data);
                    return event.data;
                  },
                }),
                target: "loadingInitalData",
              },
            ],
            onError: [
              {
                target: "loadingInitalData",
              },
            ],
          },
        },
        noDocumentsAvailable: {
          type: "final",
        },
      },
      id: "loadPage",
    },
    {
      guards: {
        hasDocumentId: (_, event) => {
          // @ts-ignore TODO: fix typing the event correctly
          if (event.data?.data?.me?.workspaceLoadingInfo?.documentId) {
            return true;
          }
          return false;
        },
      },
      actions: {
        redirectToDocument: (context) => {
          if (
            context.meWithWorkspaceLoadingInfoQueryResult?.data?.me
              ?.workspaceLoadingInfo
          ) {
            context.navigation.replace("Workspace", {
              workspaceId:
                context.meWithWorkspaceLoadingInfoQueryResult.data.me
                  .workspaceLoadingInfo.id,
              screen: "Page",
              params: {
                pageId:
                  context.meWithWorkspaceLoadingInfoQueryResult.data.me
                    .workspaceLoadingInfo.documentId,
              },
            });
          } else {
            throw new Error("workspaceLoadingInfo was not defined");
          }
        },
      },
      services: {
        getLastUsedDocumentId: async (context) => {
          return await getLastUsedDocumentId(context.workspaceId);
        },
      },
    }
  );
