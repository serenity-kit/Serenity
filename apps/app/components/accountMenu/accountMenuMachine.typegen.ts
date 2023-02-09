// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {};
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingActions: {
    showErrorToast:
      | "MeQuery.ERROR"
      | "WorkspaceQuery.ERROR"
      | "WorkspacesQuery.ERROR";
    spawnActors: "CLOSE" | "OPEN" | "xstate.init";
    stopActors: "CLOSE" | "OPEN" | "xstate.init";
  };
  eventsCausingServices: {};
  eventsCausingGuards: {};
  eventsCausingDelays: {};
  matchesStates: "closed" | "open";
  tags: never;
}
