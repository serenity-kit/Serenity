// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "done.invoke.createComment": {
      type: "done.invoke.createComment";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "done.invoke.deleteComment": {
      type: "done.invoke.deleteComment";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.createComment": {
      type: "error.platform.createComment";
      data: unknown;
    };
    "error.platform.deleteComment": {
      type: "error.platform.deleteComment";
      data: unknown;
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    createComment: "done.invoke.createComment";
    deleteComment: "done.invoke.deleteComment";
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
    showDeleteErrorToast: "error.platform.createComment";
    showErrorToast: "CommentsByDocumentIdQuery.ERROR";
    spawnActors:
      | "done.invoke.createComment"
      | "done.invoke.deleteComment"
      | "error.platform.createComment"
      | "error.platform.deleteComment"
      | "xstate.init";
    stopActors: "done.invoke.createComment" | "done.invoke.deleteComment";
    updateCommentText: "UPDATE_COMMENT_TEXT";
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {
    hasNoNetworkError:
      | "done.invoke.createComment"
      | "done.invoke.deleteComment";
  };
  eventsCausingServices: {
    createComment: "CREATE_COMMENT";
    deleteComment: "DELETE_COMMENT";
  };
  matchesStates: "creatingComment" | "deletingComment" | "idle";
  tags: never;
}
