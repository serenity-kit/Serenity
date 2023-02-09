// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "done.invoke.createComment": {
      type: "done.invoke.createComment";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.createComment": {
      type: "error.platform.createComment";
      data: unknown;
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    createComment: "done.invoke.createComment";
  };
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingActions: {
    clearCommentText: "done.invoke.createComment";
    showErrorToast: "CommentsByDocumentIdQuery.ERROR";
    spawnActors:
      | "done.invoke.createComment"
      | "error.platform.createComment"
      | "xstate.init";
    stopActors: "done.invoke.createComment";
    updateCommentText: "UPDATE_COMMENT_TEXT";
  };
  eventsCausingServices: {
    createComment: "CREATE_COMMENT";
  };
  eventsCausingGuards: {
    hasNoNetworkError: "done.invoke.createComment";
  };
  eventsCausingDelays: {};
  matchesStates: "creatingComment" | "idle";
  tags: never;
}
