// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "done.invoke.loadInitialDataMachine": {
      type: "done.invoke.loadInitialDataMachine";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {};
  missingImplementations: {
    actions: never;
    delays: never;
    guards: never;
    services: "loadInitialDataMachine";
  };
  eventsCausingActions: {};
  eventsCausingDelays: {};
  eventsCausingGuards: {
    hasDocumentAccess: "done.invoke.loadInitialDataMachine";
  };
  eventsCausingServices: {
    loadInitialDataMachine: "xstate.init";
  };
  matchesStates: "hasNoAccess" | "loadDocument" | "loadingInitialData";
  tags: never;
}
