// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "done.invoke.createComment": {
      type: "done.invoke.createComment";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "done.invoke.createReply": {
      type: "done.invoke.createReply";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "done.invoke.deleteComment": {
      type: "done.invoke.deleteComment";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "done.invoke.deleteReply": {
      type: "done.invoke.deleteReply";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.createComment": {
      type: "error.platform.createComment";
      data: unknown;
    };
    "error.platform.createReply": {
      type: "error.platform.createReply";
      data: unknown;
    };
    "error.platform.deleteComment": {
      type: "error.platform.deleteComment";
      data: unknown;
    };
    "error.platform.deleteReply": {
      type: "error.platform.deleteReply";
      data: unknown;
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    createComment: "done.invoke.createComment";
    createReply: "done.invoke.createReply";
    deleteComment: "done.invoke.deleteComment";
    deleteReply: "done.invoke.deleteReply";
  };
  missingImplementations: {
    actions: never;
    delays: never;
    guards: never;
    services: never;
  };
  eventsCausingActions: {
    clearReplyText: "done.invoke.createReply";
    decryptComments: "CommentsByDocumentIdQuery.UPDATE_RESULT";
    highlightComment: "HIGHLIGHT_COMMENT";
    setActiveSnapshotAndCommentKeys: "SET_ACTIVE_SNAPSHOT_AND_COMMENT_KEYS";
    showCreateErrorReplyToast: "error.platform.createReply";
    showCreateErrorToast: "error.platform.createComment";
    showDeleteErrorToast:
      | "error.platform.deleteComment"
      | "error.platform.deleteReply";
    showErrorToast: "CommentsByDocumentIdQuery.ERROR";
    spawnActors:
      | "SET_ACTIVE_SNAPSHOT_AND_COMMENT_KEYS"
      | "done.invoke.createComment"
      | "done.invoke.createReply"
      | "done.invoke.deleteComment"
      | "done.invoke.deleteReply"
      | "error.platform.createComment"
      | "error.platform.createReply"
      | "error.platform.deleteComment"
      | "error.platform.deleteReply";
    stopActors:
      | "done.invoke.createComment"
      | "done.invoke.createReply"
      | "done.invoke.deleteComment"
      | "done.invoke.deleteReply";
    updateReplyText: "UPDATE_REPLY_TEXT";
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {
    hasNoNetworkError:
      | "done.invoke.createComment"
      | "done.invoke.createReply"
      | "done.invoke.deleteComment"
      | "done.invoke.deleteReply";
  };
  eventsCausingServices: {
    createComment: "CREATE_COMMENT";
    createReply: "CREATE_REPLY";
    deleteComment: "DELETE_COMMENT";
    deleteReply: "DELETE_REPLY";
  };
  matchesStates:
    | "creatingComment"
    | "creatingReply"
    | "deletingComment"
    | "deletingReply"
    | "idle"
    | "waitingForActiveSnapshot";
  tags: never;
}
