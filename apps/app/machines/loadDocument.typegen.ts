// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "": { type: "" };
    "done.invoke.Document Loading.remote.loading:invocation[0]": {
      type: "done.invoke.Document Loading.remote.loading:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    decrypt: "done.invoke.Document Loading.remote.fetched:invocation[0]";
    fetch: "done.invoke.Document Loading.remote.loading:invocation[0]";
    load: "done.invoke.Document Loading.local.loading:invocation[0]";
  };
  missingImplementations: {
    actions: never;
    services: "load" | "fetch" | "decrypt";
    guards: "isMobileOrDesktop" | "isTombstone";
    delays: never;
  };
  eventsCausingActions: {};
  eventsCausingServices: {
    decrypt: "done.invoke.Document Loading.remote.loading:invocation[0]";
    fetch: "xstate.init";
    load: "";
  };
  eventsCausingGuards: {
    isMobileOrDesktop: "";
    isTombstone: "done.invoke.Document Loading.remote.loading:invocation[0]";
  };
  eventsCausingDelays: {};
  matchesStates:
    | "local"
    | "local.idle"
    | "local.loading"
    | "local.notFound"
    | "local.success"
    | "remote"
    | "remote.failedToDecrypt"
    | "remote.failedToFetch"
    | "remote.fetched"
    | "remote.loading"
    | "remote.removed"
    | "remote.success"
    | {
        local?: "idle" | "loading" | "notFound" | "success";
        remote?:
          | "failedToDecrypt"
          | "failedToFetch"
          | "fetched"
          | "loading"
          | "removed"
          | "success";
      };
  tags: never;
}
