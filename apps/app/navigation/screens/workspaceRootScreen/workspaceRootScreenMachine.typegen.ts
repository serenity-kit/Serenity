// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "done.invoke.loadInitialDataMachine": {
      type: "done.invoke.loadInitialDataMachine";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "done.invoke.loadPage.loadLastUsedDocumentId:invocation[0]": {
      type: "done.invoke.loadPage.loadLastUsedDocumentId:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.loadPage.loadLastUsedDocumentId:invocation[0]": {
      type: "error.platform.loadPage.loadLastUsedDocumentId:invocation[0]";
      data: unknown;
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    getLastUsedDocumentId: "done.invoke.loadPage.loadLastUsedDocumentId:invocation[0]";
  };
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingActions: {
    redirectToDocument: "done.invoke.loadInitialDataMachine";
  };
  eventsCausingServices: {
    getLastUsedDocumentId: "xstate.init";
  };
  eventsCausingGuards: {
    hasDocumentId: "done.invoke.loadInitialDataMachine";
  };
  eventsCausingDelays: {};
  matchesStates:
    | "loadLastUsedDocumentId"
    | "loadingInitialData"
    | "noDocumentsAvailable"
    | "redirectToDocument";
  tags: never;
}
