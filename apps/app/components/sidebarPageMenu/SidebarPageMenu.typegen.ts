// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "done.invoke.deletePage": {
      type: "done.invoke.deletePage";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.deletePage": {
      type: "error.platform.deletePage";
      data: unknown;
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    deletePage: "done.invoke.deletePage";
  };
  missingImplementations: {
    actions: never;
    delays: never;
    guards: never;
    services: never;
  };
  eventsCausingActions: {
    navigateToWorkspaceRoot: "done.invoke.deletePage";
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {
    deletePage: "confirmDelete";
  };
  matchesStates: "deleteModal" | "deleted" | "deleting" | "idle" | "menu";
  tags: never;
}
