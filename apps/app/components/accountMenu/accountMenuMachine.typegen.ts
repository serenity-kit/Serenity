// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {};
  missingImplementations: {
    actions: never;
    delays: never;
    guards: never;
    services: never;
  };
  eventsCausingActions: {
    showErrorToast:
      | "MeQuery.ERROR"
      | "WorkspaceQuery.ERROR"
      | "WorkspacesQuery.ERROR";
    spawnActors: "CLOSE" | "OPEN" | "xstate.init";
    stopActors: "CLOSE" | "OPEN" | "xstate.init";
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates: "closed" | "open";
  tags: never;
}
