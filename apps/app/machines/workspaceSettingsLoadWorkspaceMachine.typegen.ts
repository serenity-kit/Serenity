// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "done.invoke.fetchWorkspaceAndDecryptInfo": {
      type: "done.invoke.fetchWorkspaceAndDecryptInfo";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "done.invoke.loadInitialDataMachine": {
      type: "done.invoke.loadInitialDataMachine";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.fetchWorkspaceAndDecryptInfo": {
      type: "error.platform.fetchWorkspaceAndDecryptInfo";
      data: unknown;
    };
    "error.platform.loadInitialDataMachine": {
      type: "error.platform.loadInitialDataMachine";
      data: unknown;
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    fetchWorkspaceAndDecryptInfo: "done.invoke.fetchWorkspaceAndDecryptInfo";
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
  eventsCausingGuards: {
    hasNoNetworkErrorAndWorkspaceFound: "done.invoke.fetchWorkspaceAndDecryptInfo";
  };
  eventsCausingServices: {
    fetchWorkspaceAndDecryptInfo: "done.invoke.loadInitialDataMachine";
    loadInitialDataMachine: "xstate.init";
  };
  matchesStates:
    | "loadWorkspace"
    | "loadWorkspaceFailed"
    | "loadWorkspaceSuccess"
    | "loadingInitialData";
  tags: never;
}
