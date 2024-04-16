import { assign, fromPromise, setup } from "xstate";
import {
  MeWithWorkspaceLoadingInfoQueryResult,
  loadInitialDataMachine,
} from "../../../machines/loadInitialData";
import { getLastOpenDocumentId } from "../../../store/workspaceStore";

type Input = {
  workspaceId: string;
  navigation: any;
};

type Context = {
  workspaceId: string;
  navigation: any;
  lastOpenDocumentId?: string;
  meWithWorkspaceLoadingInfoQueryResult?: MeWithWorkspaceLoadingInfoQueryResult;
};

export const workspaceRootScreenMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QHcD2AnA1rADgQwGMwAlVVAFwGUD0wwA7AOgBtU8IBLeqASXo-Ic8zACJ5yeAMQRU9MIy4A3VJnmt2fAUNHi8AWUIALLmESgcqWFtlmQAD0QBGACwBORgGZHrgEy+ADIGuzv6OADQgAJ5OAOzuAKz+Hj4AHL7xqSkAbD4+AL55EWhYuIQkZFQ0dEzqnNyagsJiEpJg6OgYjDjM4gBmGAC2LGwQDdrN+kYmthZWgjZI9ogAtD7xHoy5Wc4eWXseri5ZHhHRCDsxjN4+yc4+-lmuMX5ZBUUY2PhEpBTUtAzDdgAGTwsHIAFVYJARKgCABXAYMcg8CDSWTyJQqeTFT5lH6Vf41EYgsGQ6GwhFIlEITEEcQcWQAbX8AF0ZpZrPRbA4EMtdilGK5-CkDq51s5ts5nPFTogbpd-PEYnEYik1qlXCkYm8QDjSt8Kn9qoCICSIVCIDD4Yj6MjUW0Ouguj1yP10EM9V9yr8qgDamayZaKTa7TT6Mo6fN6My2YtZpzuSsPDtPP57il-Mq08msrKEI5k54so5tvFjo4fMcPAVCiB6KgIHBbJ68YbfUT2FxePxGjoJOy5gyuYsecssgKK+t4tL-HcYvFHDKonKpVctRWbgdvPF4ikdS2DT7CYxaJxaARyAAVVBWym2gcJkeIY4+RgpXcxELjlLZFLOPMlo4jDxMEJbbH+0p-tqtYHt6BLGv6oLmuS1pUhAD5RomvIxBWgoeAu-iuMEPgVh4MR5jcWSbL4HjZHs84-vuHz6nBRoAvWt4hrAACCih4BwPQAEbMKYcYcphT4IMczjAXEwrlo4cQZHmyTuM4jiZncBzvocwRMSUXr4mxw7mOJQ5YcsMS7HhBFEXcpHkcuUmvmRUoeIqIraRKNZ5EAA */
  setup({
    types: {} as {
      context: Context;
      input: Input;
    },
    guards: {
      hasDocumentId: ({ event }) => {
        if (event.data?.data?.me?.workspaceLoadingInfo?.documentId) {
          return true;
        }
        return false;
      },
    },
    actions: {
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
          throw new Error("workspaceLoadingInfo was not defined");
        }
      },
    },
    actors: {
      loadInitialDataMachine,
      getLastUsedDocumentId: fromPromise(
        async ({ input }: { input: Context }) => {
          return getLastOpenDocumentId({
            workspaceId: input.workspaceId,
          });
        }
      ),
    },
  }).createMachine({
    context: ({ input }) => ({
      workspaceId: input.workspaceId,
      navigation: input.navigation,
    }),
    initial: "loadLastUsedDocumentId",
    states: {
      loadingInitialData: {
        invoke: {
          src: "loadInitialDataMachine",
          id: "loadInitialDataMachine",
          input: ({ context }) => {
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
                // @ts-expect-error needs proper typing
                meWithWorkspaceLoadingInfoQueryResult: ({ event }) => {
                  return event.output;
                },
              }),
              guard: "hasDocumentId",
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
        // TODO doesn't need to be async
        invoke: {
          src: "getLastUsedDocumentId",
          input: ({ context }) => {
            return { ...context };
          },
          onDone: [
            {
              actions: assign({
                lastOpenDocumentId: ({ event }) => {
                  return event.output;
                },
              }),
              target: "loadingInitialData",
            },
          ],
          onError: [
            {
              target: "loadingInitialData",
            },
          ],
        },
      },
      noDocumentsAvailable: {
        type: "final",
      },
    },
    id: "workspaceRootScreen",
  });
