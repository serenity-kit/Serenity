// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "done.invoke.fetchWorkspace": {
      type: "done.invoke.fetchWorkspace";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "done.invoke.loadInitialDataMachine": {
      type: "done.invoke.loadInitialDataMachine";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.fetchWorkspace": {
      type: "error.platform.fetchWorkspace";
      data: unknown;
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    fetchWorkspace: "done.invoke.fetchWorkspace";
  };
  missingImplementations: {
    actions: never;
    delays: never;
    guards: never;
    services: "loadInitialDataMachine";
  };
  eventsCausingActions: {};
  eventsCausingDelays: {};
  eventsCausingGuards: {
    hasNoNetworkErrorAndWorkspaceFound: "done.invoke.fetchWorkspace";
  };
  eventsCausingServices: {
    fetchWorkspace: "done.invoke.loadInitialDataMachine";
    loadInitialDataMachine: "xstate.init";
  };
  matchesStates:
    | "loadWorkspace"
    | "loadWorkspaceFailed"
    | "loadWorkspaceSuccess"
    | "loadingInitialData";
  tags: never;
}
