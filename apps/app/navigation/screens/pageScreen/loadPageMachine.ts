import { createMachine } from "xstate";
import { loadInitialDataMachine } from "../../../machines/loadInitialData";

type Context = {
  workspaceId: string;
  documentId: string;
  navigation: any;
};

export const loadPageMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5gF8A0IB2B7CdGgBssBDCABWJgDojSBLDKASQzoBdiCARYj-EAA5ZY7Olgz8AHogAsAJnQBPRAA4AnFTUqA7HJkBmbdoAMM7QFZjANmRoQtcpTD8hItmIlIQ0hAEYVSoj+VMahxnIqKjLhalbG+nK2tkA */
  createMachine(
    {
      context: { navigation: null } as Context,
      tsTypes: {} as import("./loadPageMachine.typegen").Typegen0,
      predictableActionArguments: true,
      initial: "loadingInitalData",
      states: {
        loadingInitalData: {
          invoke: {
            src: loadInitialDataMachine,
            id: "loadInitialDataMachine",
          },
        },
      },
      id: "loadPage",
    },
    {
      guards: {},
      actions: {},
    }
  );
