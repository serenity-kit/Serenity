import { assign, setup } from "xstate";
import {
  MeWithWorkspaceLoadingInfoQueryResult,
  loadInitialDataMachine,
} from "../../../machines/loadInitialData";

type Input = {
  workspaceId: string;
  documentId: string;
  navigation: any;
};

type Context = {
  workspaceId: string;
  documentId: string;
  navigation: any;
  meWithWorkspaceLoadingInfoQueryResult?: MeWithWorkspaceLoadingInfoQueryResult;
};

export const loadPageMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QBsD2BDCAFdMB0amAlgHZQCSJRALusgCLq0DEEqJYepAbqgNadCESjSJ1GtALLoAxgAtSYRKAAOqWKPbKQAD0QAmAKwAGPAE5jZgCwnjAdgBsAZgsO7AGhABPRAEZ7eE6GVnZmAByGDr4OZmZOdgC+SZ4kqBBw2kI4+EKkFFS0DEzo2moa1ERaSLqIVvqePghhZuZhdvpW8XbGISYOySBZuIIYEPSoMgCuALZgJNSl6pok2noIhu14hoa+scYuDm5tDX6+hnghYfrRTk76xmFObQND+HLosAByqACCMjJweDVMrLVaIDamYwONq+CJWYy+IKGE4IfSbMxRMJXEKwuy3F6jbJKYFLCpVUBrWEo2F4Yx0-bBfQOBHBKxWJJJIA */
  setup({
    types: {} as {
      context: Context;
      input: Input;
    },
    guards: {
      hasDocumentAccess: ({ event }) => {
        if (event.output?.data?.me?.workspaceLoadingInfo?.documentId) {
          return true;
        }
        return false;
      },
    },
    actions: {},
    actors: {
      loadInitialDataMachine,
    },
  }).createMachine({
    context: ({ input }) => ({
      workspaceId: input.workspaceId,
      documentId: input.documentId,
      navigation: input.navigation,
    }),
    initial: "loadingInitialData",
    states: {
      loadingInitialData: {
        invoke: {
          src: "loadInitialDataMachine",
          id: "loadInitialDataMachine",
          input: ({ context }) => {
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
                // @ts-expect-error needs proper typing
                meWithWorkspaceLoadingInfoQueryResult: ({ event }) => {
                  return event.output;
                },
              }),
              guard: "hasDocumentAccess",
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
  });
