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
    "done.invoke.getLastUsedWorkspaceAndDocumentId": {
      type: "done.invoke.getLastUsedWorkspaceAndDocumentId";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.fetchMeWithWorkspaceLoadingInfo": {
      type: "error.platform.fetchMeWithWorkspaceLoadingInfo";
      data: unknown;
    };
    "error.platform.getLastUsedWorkspaceAndDocumentId": {
      type: "error.platform.getLastUsedWorkspaceAndDocumentId";
      data: unknown;
    };
    "xstate.after(2000)#rootScreen.failure": {
      type: "xstate.after(2000)#rootScreen.failure";
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    fetchMeWithWorkspaceLoadingInfo: "done.invoke.fetchMeWithWorkspaceLoadingInfo";
    getLastUsedWorkspaceAndDocumentId: "done.invoke.getLastUsedWorkspaceAndDocumentId";
  };
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingActions: {
    redirectToDocument: "";
    redirectToLobby: "";
    redirectToLogin: "";
    redirectToNoWorkspaces: "";
  };
  eventsCausingServices: {
    fetchMeWithWorkspaceLoadingInfo:
      | "done.invoke.getLastUsedWorkspaceAndDocumentId"
      | "error.platform.getLastUsedWorkspaceAndDocumentId"
      | "xstate.after(2000)#rootScreen.failure";
    getLastUsedWorkspaceAndDocumentId: "xstate.init";
  };
  eventsCausingGuards: {
    hasAccessToWorkspace: "";
    hasNoNetworkError: "done.invoke.fetchMeWithWorkspaceLoadingInfo";
    isAuthorized: "";
    isValidSession: "";
  };
  eventsCausingDelays: {};
  matchesStates:
    | "failure"
    | "hasNoWorkspaces"
    | "hasWorkspaceAccess"
    | "invalidSession"
    | "loaded"
    | "loading"
    | "loadingLastUsedWorkspaceAndDocumentId"
    | "notAuthorized"
    | "redirectToDocument"
    | "validSession";
  tags: never;
}
