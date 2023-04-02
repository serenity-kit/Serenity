// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "done.invoke.loadInitialDataMachine": {
      type: "done.invoke.loadInitialDataMachine";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.loadInitialDataMachine": {
      type: "error.platform.loadInitialDataMachine";
      data: unknown;
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    loadInitialDataMachine: "done.invoke.loadInitialDataMachine";
  };
  missingImplementations: {
    actions: never;
    delays: never;
    guards: never;
    services: never;
  };
  eventsCausingActions: {};
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {
    loadInitialDataMachine: "xstate.init";
  };
  matchesStates: "loadSettings" | "loadingInitialData";
  tags: never;
}
