// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "": { type: "" };
    "done.invoke.fetchMe": {
      type: "done.invoke.fetchMe";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.fetchMe": { type: "error.platform.fetchMe"; data: unknown };
    "xstate.after(2000)#loadMeAndVerify.failure": {
      type: "xstate.after(2000)#loadMeAndVerify.failure";
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    fetchMe: "done.invoke.fetchMe";
  };
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingActions: {
    redirectToLogin: "";
  };
  eventsCausingServices: {
    fetchMe: "xstate.after(2000)#loadMeAndVerify.failure" | "xstate.init";
  };
  eventsCausingGuards: {
    hasNoNetworkError: "done.invoke.fetchMe";
    isValidSession: "";
  };
  eventsCausingDelays: {};
  matchesStates:
    | "failure"
    | "invalidSession"
    | "loaded"
    | "loading"
    | "validSession";
  tags: never;
}
