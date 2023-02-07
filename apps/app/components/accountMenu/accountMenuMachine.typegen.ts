// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "": { type: "" };
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
    spawnMeAndWorkspaceActors: "xstate.init";
    spawnWorkspacesActor: "OPEN";
    stopWorkspacesActor: "" | "CLOSE";
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates: "closed" | "idle" | "open";
  tags: never;
}
