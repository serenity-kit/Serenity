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
    delays: never;
    guards: never;
    services: never;
  };
  eventsCausingActions: {
    clearCommentText: "done.invoke.createComment";
    decryptComments: "CommentsByDocumentIdQuery.UPDATE_RESULT";
    showErrorToast: "CommentsByDocumentIdQuery.ERROR";
    spawnActors:
      | "done.invoke.createComment"
      | "error.platform.createComment"
      | "xstate.init";
    stopActors: "done.invoke.createComment";
    updateCommentText: "UPDATE_COMMENT_TEXT";
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {
    hasNoNetworkError: "done.invoke.createComment";
  };
  eventsCausingServices: {
    createComment: "CREATE_COMMENT";
  };
  matchesStates: "creatingComment" | "idle";
  tags: never;
}
