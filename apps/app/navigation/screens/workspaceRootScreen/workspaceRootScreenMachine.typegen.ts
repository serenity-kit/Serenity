// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "done.invoke.loadInitialDataMachine": {
      type: "done.invoke.loadInitialDataMachine";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "done.invoke.workspaceRootScreen.loadLastUsedDocumentId:invocation[0]": {
      type: "done.invoke.workspaceRootScreen.loadLastUsedDocumentId:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.loadInitialDataMachine": {
      type: "error.platform.loadInitialDataMachine";
      data: unknown;
    };
    "error.platform.workspaceRootScreen.loadLastUsedDocumentId:invocation[0]": {
      type: "error.platform.workspaceRootScreen.loadLastUsedDocumentId:invocation[0]";
      data: unknown;
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    getLastUsedDocumentId: "done.invoke.workspaceRootScreen.loadLastUsedDocumentId:invocation[0]";
    loadInitialDataMachine: "done.invoke.loadInitialDataMachine";
  };
  missingImplementations: {
    actions: never;
    delays: never;
    guards: never;
    services: never;
  };
  eventsCausingActions: {
    redirectToDocument: "done.invoke.loadInitialDataMachine";
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {
    hasDocumentId: "done.invoke.loadInitialDataMachine";
  };
  eventsCausingServices: {
    getLastUsedDocumentId: "xstate.init";
    loadInitialDataMachine:
      | "done.invoke.workspaceRootScreen.loadLastUsedDocumentId:invocation[0]"
      | "error.platform.workspaceRootScreen.loadLastUsedDocumentId:invocation[0]";
  };
  matchesStates:
    | "loadLastUsedDocumentId"
    | "loadingInitialData"
    | "noDocumentsAvailable"
    | "redirectToDocument";
  tags: never;
}
