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
  /** @xstate-layout N4IgpgJg5mDOIC5QHcD2AnA1rADgQwGMwAlVVAFwGUD0wwA7AOgBtU8IBLeqASXo-Ic8zACJ5yeAMQRU9MIy4A3VJnmt2fAUNHi8AWUIALLmESgcqWFtlmQAD0QBGACwBORgGZHrgEy+ADIGuzv6OADQgAJ5OAOzuAKz+Hj4AHL7xqSkAbD4+AL55EWhYuIQkZFQ0dEzqnNyagsJiEpJg6OgYjDjM4gBmGAC2LGwQDdrN+kYmthZWgjZI9ogAtD7xHoy5Wc4eWXseri5ZHhHRCDsxjN4+yc4+-lmuMX5ZBUUY2PhEpBTUtAzDdgAGTwsHIAFVYJARKgCABXAYMcg8CDSWTyJQqeTFT5lH6Vf41EYgsGQ6GwhFIlEITEEcQcWQAbX8AF0ZpZrPRbA4EMtdilGK5-CkDq51s5ts5nPFTogbpd-PEYnEYik1qlXCkYm8QDjSt8Kn9qoCICSIVCIDD4Yj6MjUW0Ouguj1yP10EM9V9yr8qgDamayZaKTa7TT6Mo6fN6My2YtZpzuSsPDtPP57il-Mq08msrKEI5k54so5tvFjo4fMcPAVCiB6KgIHBbJ68YbfUT2FxePxGjoJOy5gyuYsecssgKK+t4tL-HcYvFHDKonKpVctRWbgdvPF4ikdS2DT7CYxaJxaARyAAVVBWym2gcJkeIY4+RgpXcxELjlLZFLOPMlo4jDxMEJbbH+0p-tqtYHt6BLGv6oLmuS1pUhAD5RomvIxBWgoeAu-iuMEPgVh4MR5jcWSbL4HjZHs84-vuHz6nBRoAvWt4hrAACCih4BwPQAEbMKYcYcphT4IMczjAXEwrlo4cQZHmyTuM4jiZncBzvocwRMSUXr4mxw7mOJQ5YcsMS7HhBFEXcpHkcuUmvmRUoeIqIraRKNZ5EAA */
  createMachine(
    {
      context: { navigation: null } as Context,
      tsTypes: {} as import("./workspaceRootScreenMachine.typegen").Typegen0,
      predictableActionArguments: true,
      initial: "loadLastUsedDocumentId",
      states: {
        loadingInitialData: {
          invoke: {
            src: loadInitialDataMachine,
            id: "loadInitialDataMachine",
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
