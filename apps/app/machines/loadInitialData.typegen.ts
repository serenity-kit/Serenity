// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "": { type: "" };
    "done.invoke.fetch-meWithWorkspaceLoadingInfo": {
      type: "done.invoke.fetch-meWithWorkspaceLoadingInfo";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.fetch-meWithWorkspaceLoadingInfo": {
      type: "error.platform.fetch-meWithWorkspaceLoadingInfo";
      data: unknown;
    };
    "xstate.after(2000)#loadInitialData.failure": {
      type: "xstate.after(2000)#loadInitialData.failure";
    };
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
    redirectToLobby: "";
    redirectToLogin: "";
    redirectToNoWorkspaces: "";
  };
  eventsCausingServices: {};
  eventsCausingGuards: {
    hasAccessToWorkspace: "";
    hasAnyWorkspaces: "";
    hasNoNetworkError: "done.invoke.fetch-meWithWorkspaceLoadingInfo";
    isAuthorized: "";
    isValidSession: "";
  };
  eventsCausingDelays: {};
  matchesStates:
    | "authorized"
    | "failure"
    | "hasNoWorkspaces"
    | "hasWorkspaceAccess"
    | "invalidSession"
    | "loaded"
    | "loading"
    | "noAccess"
    | "notAuthorized"
    | "ready"
    | "validSession";
  tags: never;
}
