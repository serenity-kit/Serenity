import { assign, createMachine } from "xstate";
import {
  loadInitialDataMachine,
  MeWithWorkspaceLoadingInfoQueryResult,
} from "../../../machines/loadInitialData";

type Context = {
  workspaceId: string;
  documentId: string;
  navigation: any;
  meWithWorkspaceLoadingInfoQueryResult: MeWithWorkspaceLoadingInfoQueryResult;
};

export const loadPageMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QBsD2BDCAFdMB0amAlgHZQCSJRALusgCLq0DEEqJYepAbqgNadCESjSJ1GtALLoAxgAtSYRKAAOqWKPbKQAD0QAmAKwAGPAE5jZgCwnjAdgBsAZgsO7AGhABPRAEZ7eE6GVnZmAByGDr4OZmZOdgC+SZ4kqBBw2kI4+EKkFFS0DEzo2moa1ERaSLqIVvqePghhZuZhdvpW8XbGISYOySBZuIIYEPSoMgCuALZgJNSl6pok2noIhu14hoa+scYuDm5tDX6+hnghYfrRTk76xmFObQND+HLosAByqACCMjJweDVMrLVaIDamYwONq+CJWYy+IKGE4IfSbMxRMJXEKwuy3F6jbJKYFLCpVUBrWEo2F4Yx0-bBfQOBHBKxWJJJIA */
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
            data: (context) => {
              return {
                returnOtherWorkspaceIfNotFound: false,
                returnOtherDocumentIfNotFound: false,
                workspaceId: context.workspaceId,
                documentId: context.documentId,
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
                cond: "hasDocumentAccess",
                target: "loadDocument",
              },
              {
                target: "hasNoAccess",
              },
            ],
          },
        },
        loadDocument: {
          type: "final",
        },
        hasNoAccess: {
          type: "final",
        },
      },
      id: "loadPage",
    },
    {
      guards: {
        hasDocumentAccess: (_, event) => {
          // @ts-ignore no sure how to type it
          if (event.data?.data?.me?.workspaceLoadingInfo?.documentId) {
            return true;
          }
          return false;
        },
      },
      actions: {},
    }
  );
