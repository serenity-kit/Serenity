// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "": { type: "" };
    "done.invoke.fetchMeWithWorkspaceLoadingInfo": {
      type: "done.invoke.fetchMeWithWorkspaceLoadingInfo";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.fetchMeWithWorkspaceLoadingInfo": {
      type: "error.platform.fetchMeWithWorkspaceLoadingInfo";
      data: unknown;
    };
    "xstate.after(2000)#loadInitialData.failure": {
      type: "xstate.after(2000)#loadInitialData.failure";
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    fetchMeWithWorkspaceLoadingInfo: "done.invoke.fetchMeWithWorkspaceLoadingInfo";
  };
  missingImplementations: {
    actions: never;
    delays: never;
    guards: never;
    services: never;
  };
  eventsCausingActions: {
    redirectToLobby: "";
    redirectToLogin: "";
    redirectToNotFoundOrNoWorkspaces: "";
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {
    hasAccessToWorkspace: "";
    hasNoNetworkError: "done.invoke.fetchMeWithWorkspaceLoadingInfo";
    isAuthorized: "";
    isValidSession: "";
  };
  eventsCausingServices: {
    fetchMeWithWorkspaceLoadingInfo:
      | "xstate.after(2000)#loadInitialData.failure"
      | "xstate.init";
  };
  matchesStates:
    | "failure"
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
