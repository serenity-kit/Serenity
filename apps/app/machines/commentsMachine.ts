import {
  decryptComment,
  deriveKeysFromKeyDerivationTrace,
  encryptComment,
  LocalDevice,
} from "@serenity-tools/common";
import { AnyActorRef, assign, createMachine, spawn } from "xstate";
import {
  CommentsByDocumentIdQueryResult,
  commentsByDocumentIdQueryService,
  CommentsByDocumentIdQueryServiceEvent,
  CommentsByDocumentIdQueryUpdateResultEvent,
  runCreateCommentMutation,
  runCreateCommentReplyMutation,
  runDeleteCommentRepliesMutation,
  runDeleteCommentsMutation,
} from "../generated/graphql";
import { createCommentKeyAndKeyDerivationTrace } from "../utils/createCommentKeyAndKeyDerivationTrace/createCommentKeyAndKeyDerivationTrace";
import { showToast } from "../utils/toast/showToast";

type Params = {
  pageId: string;
  activeDevice: LocalDevice | null;
};

type DecryptedReply = {
  id: string;
  text: string;
};

type DecryptedComment = {
  id: string;
  text: string;
  from: number;
  to: number;
  replies: DecryptedReply[];
};

interface Context {
  params: Params;
  commentsByDocumentIdQueryResult?: CommentsByDocumentIdQueryResult;
  commentsByDocumentIdQueryError: boolean;
  commentsByDocumentIdQueryActor?: AnyActorRef;
  decryptedComments: DecryptedComment[];
  replyTexts: Record<string, string>;
}

export const commentsMachine = createMachine(
  {
    schema: {
      events: {} as
        | CommentsByDocumentIdQueryServiceEvent
        | { type: "CREATE_COMMENT"; text: string; from: number; to: number }
        | { type: "DELETE_COMMENT"; commentId: string }
        | { type: "UPDATE_REPLY_TEXT"; text: string; commentId: string }
        | { type: "CREATE_REPLY"; commentId: string }
        | { type: "DELETE_REPLY"; replyId: string },
      context: {} as Context,
    },
    tsTypes: {} as import("./commentsMachine.typegen").Typegen0,
    predictableActionArguments: true,
    context: {
      params: {
        pageId: "",
        activeDevice: null,
      },
      commentsByDocumentIdQueryError: false,
      decryptedComments: [],
      replyTexts: {},
    },
    initial: "idle",
    on: {
      "CommentsByDocumentIdQuery.UPDATE_RESULT": {
        actions: [
          assign((_, event: CommentsByDocumentIdQueryUpdateResultEvent) => {
            return {
              commentsByDocumentIdQueryError: false,
              commentsByDocumentIdQueryResult: event.result,
            };
          }),
          "decryptComments",
        ],
      },
      "CommentsByDocumentIdQuery.ERROR": {
        actions: [
          "showErrorToast",
          assign({ commentsByDocumentIdQueryError: true }),
        ],
      },
      UPDATE_REPLY_TEXT: {
        actions: ["updateReplyText"],
      },
    },
    states: {
      idle: {
        entry: ["spawnActors"],
        on: {
          CREATE_COMMENT: "creatingComment",
          DELETE_COMMENT: "deletingComment",
          CREATE_REPLY: "creatingReply",
          DELETE_REPLY: "deletingReply",
        },
      },
      deletingComment: {
        invoke: {
          src: "deleteComment",
          id: "deleteComment",
          onDone: [
            {
              actions: ["stopActors", "spawnActors"], // respawn to trigger a request,
              cond: "hasNoNetworkError",
              target: "idle",
            },
            {
              target: "idle",
            },
          ],
          onError: [
            {
              actions: ["showDeleteErrorToast"],
              target: "idle",
            },
          ],
        },
      },
      deletingReply: {
        invoke: {
          src: "deleteReply",
          id: "deleteReply",
          onDone: [
            {
              actions: ["stopActors", "spawnActors"], // respawn to trigger a request,
              cond: "hasNoNetworkError",
              target: "idle",
            },
            {
              target: "idle",
            },
          ],
          onError: [
            {
              actions: ["showDeleteErrorToast"],
              target: "idle",
            },
          ],
        },
      },
      creatingComment: {
        invoke: {
          src: "createComment",
          id: "createComment",
          onDone: [
            {
              actions: ["stopActors", "spawnActors"], // respawn to trigger a request,
              cond: "hasNoNetworkError",
              target: "idle",
            },
            {
              target: "idle",
            },
          ],
          onError: [
            {
              actions: ["showCreateErrorToast"],
              target: "idle",
            },
          ],
        },
      },
      creatingReply: {
        invoke: {
          src: "createReply",
          id: "createReply",
          onDone: [
            {
              actions: ["clearReplyText", "stopActors", "spawnActors"], // respawn to trigger a request,
              cond: "hasNoNetworkError",
              target: "idle",
            },
            {
              target: "idle",
            },
          ],
          onError: [
            {
              actions: ["showCreateErrorReplyToast"],
              target: "idle",
            },
          ],
        },
      },
    },
    id: "commentsMachine",
  },
  {
    actions: {
      showErrorToast: (context) => {
        // makes sure the error toast is only shown once
        if (!context.commentsByDocumentIdQueryError) {
          showToast("Failed to load comments.", "error");
        }
      },
      showCreateErrorToast: () => {
        showToast("Failed to create the comment.", "error");
      },
      showCreateErrorReplyToast: () => {
        showToast("Failed to create the reply.", "error");
      },
      showDeleteErrorToast: () => {
        showToast("Failed to delete the comment.", "error");
      },
      spawnActors: assign((context) => {
        return {
          commentsByDocumentIdQueryActor: spawn(
            commentsByDocumentIdQueryService(
              {
                documentId: context.params.pageId,
                deviceSigningPublicKey:
                  context.params.activeDevice!.signingPublicKey,
              },
              10000 // poll only every 10 seconds
            )
          ),
        };
      }),
      stopActors: (context) => {
        if (context.commentsByDocumentIdQueryActor?.stop) {
          context.commentsByDocumentIdQueryActor.stop();
        }
      },
      updateReplyText: assign((context, event) => {
        return {
          replyTexts: {
            ...context.replyTexts,
            [event.commentId]: event.text,
          },
        };
      }),
      clearReplyText: assign((context, event: any) => {
        if (event.data.data.createCommentReply.commentReply.commentId) {
          return {
            replyTexts: {
              ...context.replyTexts,
              [event.data.data.createCommentReply.commentReply.commentId]: "",
            },
          };
        } else {
          return {};
        }
      }),
      decryptComments: assign((context, event) => {
        const decryptedComments =
          context.commentsByDocumentIdQueryResult?.data?.commentsByDocumentId?.nodes?.map(
            (encryptedComment) => {
              const commentKeyDerivationTraceWithKeys =
                deriveKeysFromKeyDerivationTrace({
                  keyDerivationTrace: encryptedComment?.keyDerivationTrace!,
                  activeDevice: context.params.activeDevice!,
                  workspaceKeyBox:
                    context.commentsByDocumentIdQueryResult?.data
                      ?.workspaceKeyByDocumentId?.nameWorkspaceKey
                      .workspaceKeyBox!,
                });

              const decryptedComment = decryptComment({
                key: commentKeyDerivationTraceWithKeys.trace.at(-1)?.key!,
                ciphertext: encryptedComment!.contentCiphertext,
                publicNonce: encryptedComment!.contentNonce,
              });

              const replies = encryptedComment?.commentReplies?.map(
                (encryptedReply) => {
                  const replyKeyDerivationTraceWithKeys =
                    deriveKeysFromKeyDerivationTrace({
                      keyDerivationTrace: encryptedReply?.keyDerivationTrace!,
                      activeDevice: context.params.activeDevice!,
                      workspaceKeyBox:
                        context.commentsByDocumentIdQueryResult?.data
                          ?.workspaceKeyByDocumentId?.nameWorkspaceKey
                          .workspaceKeyBox!,
                    });

                  const decryptedReply = decryptComment({
                    key: replyKeyDerivationTraceWithKeys.trace.at(-1)?.key!,
                    ciphertext: encryptedReply!.contentCiphertext,
                    publicNonce: encryptedReply!.contentNonce,
                  });

                  return {
                    id: encryptedReply!.id,
                    ...JSON.parse(decryptedReply),
                  };
                }
              );

              return {
                id: encryptedComment!.id,
                ...JSON.parse(decryptedComment),
                replies,
              };
            }
          );

        return {
          decryptedComments,
        };
      }),
    },
    services: {
      createComment: async (context, event) => {
        const { commentKey, keyDerivationTrace } =
          await createCommentKeyAndKeyDerivationTrace({
            documentId: context.params.pageId,
            activeDevice: context.params.activeDevice!,
          });

        const result = encryptComment({
          key: commentKey.key,
          comment: JSON.stringify({
            text: event.text,
            from: event.from,
            to: event.to,
          }),
        });

        return await runCreateCommentMutation({
          input: {
            documentId: context.params.pageId,
            contentCiphertext: result.ciphertext,
            contentNonce: result.publicNonce,
            keyDerivationTrace,
          },
        });
      },
      createReply: async (context, event) => {
        const { commentKey, keyDerivationTrace } =
          await createCommentKeyAndKeyDerivationTrace({
            documentId: context.params.pageId,
            activeDevice: context.params.activeDevice!,
          });

        const result = encryptComment({
          key: commentKey.key,
          comment: JSON.stringify({
            text: context.replyTexts[event.commentId],
          }),
        });
        return await runCreateCommentReplyMutation({
          input: {
            documentId: context.params.pageId,
            commentId: event.commentId,
            contentCiphertext: result.ciphertext,
            contentNonce: result.publicNonce,
            keyDerivationTrace,
          },
        });
      },
      deleteComment: async (context, event) => {
        return await runDeleteCommentsMutation({
          input: {
            commentIds: [event.commentId],
          },
        });
      },
      deleteReply: async (context, event) => {
        return await runDeleteCommentRepliesMutation({
          input: {
            commentReplyIds: [event.replyId],
          },
        });
      },
    },
    guards: {
      hasNoNetworkError: (context, event: { data: any }) => {
        return !event.data?.error?.networkError;
      },
    },
  }
);
