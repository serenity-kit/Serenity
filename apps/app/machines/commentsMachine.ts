import {
  createCommentKey,
  decryptComment,
  encryptComment,
  LocalDevice,
  recreateCommentKey,
} from "@serenity-tools/common";
import { AnyActorRef, assign, createMachine, spawn } from "xstate";
import {
  CommentsByDocumentIdQueryResult,
  commentsByDocumentIdQueryService,
  CommentsByDocumentIdQueryServiceEvent,
  CommentsByDocumentIdQueryUpdateResultEvent,
  MinimalDevice,
  runCreateCommentMutation,
  runCreateCommentReplyMutation,
  runDeleteCommentRepliesMutation,
  runDeleteCommentsMutation,
} from "../generated/graphql";
import { showToast } from "../utils/toast/showToast";

type Params = {
  // these won't change
  pageId: string;
  activeDevice: LocalDevice | null;
};

export type DecryptedReply = {
  id: string;
  text: string;
  createdAt: string;
  creatorDevice: MinimalDevice;
};

export type DecryptedComment = {
  id: string;
  text: string;
  from: number;
  to: number;
  replies: DecryptedReply[];
  createdAt: string;
  creatorDevice: MinimalDevice;
};

type CommentKeyEntry = {
  key: string;
  replyKeys: Record<string, string>;
};

export type CommentKeys = Record<string, CommentKeyEntry>;

export type ActiveSnapshot = {
  id: string;
  key: string;
};

interface Context {
  params: Params;
  commentsByDocumentIdQueryResult?: CommentsByDocumentIdQueryResult;
  commentsByDocumentIdQueryError: boolean;
  commentsByDocumentIdQueryActor?: AnyActorRef;
  decryptedComments: DecryptedComment[];
  replyTexts: Record<string, string>;
  highlightedCommentId: string | null;
  activeSnapshot: ActiveSnapshot | undefined;
  commentKeys: CommentKeys;
  isOpenSidebar: boolean;
}

export const commentsMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QGMD2BbdYB2AXWAsgIbIAWAltmAMQDCGWesAQgJ4AiqyAro7gJIQAitzAAnVgDoAqgAV2AQQAqAUQD6AJRUBlaQBklAbQAMAXUSgADqljlc5VNgsgAHogDMANgAckgEyeAJyefn7uAKzhAOyBxgCM4QA0IKyIACxhksZ+xt45ccZRUXHucQC+ZclomDj4xGSUNPQ1TGycPHyCIuJSKhoaAPIaJuZIINa29o7ObghpxmmSeWHuEX7R7mneSSkexsaS7gueUX7zQWmlFVUMtYQkFFTUcoqqmiqyegCaaqoAGkYzM4JnYHE4xrM0idJIEzuEobE0nFLoFkqkEDlFjlSsjAu4YiFctcQNU+PcGk8ABL8ADilL0tMpSjUtAGBAIKgAcoDRlYbKDphD0iEYXCoii-Kc8u40YgCr4CglolDvIFvIriaS7vVHjRtCpmQpaEp+AA1dTaTkKWTaSkDQ2c9gstkc7lqADSKi+2hGwP5U3BoFm+LikkuC3C2QSgS2kVlCDifk1tyYOsakgA7kRQdgoAAxVBiBTIewANzA2mwREssFIqFw1H1huNZotVptdodTtZ7K5zM93t9YxBAZm6WRWTicSKfmCU7CnnjhP8oU88zSp1WRMqJJTdQe6fIEAANk0tMp1D3XTy-ZMwWOEMvVptwmckSFvFF40q-JJPPFwjyEJwk8QDwmTFp9wpMBJCPU9qHYFQ9ANS8XT7Ic+TvQUg0QEJf1KdZvE8XFVWyb8zlDbxchOV9jFozx3Agsk0yoWCTzPFQL3eT4vgw8Z-XvIVH3CdxDg3bxSmVNIRO-UismMWEVnmZEQKY7UD1YuCaEQ5C3i0Hi+JHQScOE8JDgCPIonCOJYiiYwZV2R87MkYpQlnfYbNfNI1NTDSYIgMBT3sXNmj4agIEcGDKFLVAAGt-MCsBcDAULakMgTsNccdFniadTjnRMvHjNVQ0jV9ihEk4tnKHctV86DJACoLKCgVK8HCyLYOwGL4saxLkra3BDDiXl+KwwMsrmCdcpnAqF2-RUVwAzYgjozxPB8qDdT65qQr3ahxDEQtJEsY8iFwAAzQt0B2pKUr3dLxofJEcqnWbiMKxdHKnLYXNyDI6JjVUiM28ltqapKWo0MBTtYDrNO6uKEqCsBodhx6BQmyFpre-KPvmxzTlDfJ1SsySoncQJQZY5HIdzNHjzhiKEZ62nkoZ1hhtGozMux168tnfGisc7x5hhOJ1qiICYys8Dar3MH0wh4KoA5g6xCOsQTrOy7rtu9mYcZjHRyEl7JwFubhfRbwbbDBZAhiCS8M-am-MkZAxDAc6WsG+GosR3qPa9gaHqBYcMqx7Lzfe+crblWdf1nPICnFG2Cg2+XIMV1ig+9vbIL9rrWfdz3zvuyCudvTHnpxi2ha+9FkUTScjn-G3AkjG3XYa3OVd9w7jtO86rrEG7e-LvhjeMyazZmvHY4buVpMCSRIxKPwqISCJCm77be6hw2mc66KkZL4PUcPqfeajufBYX79-1EhSp1VOz7JBzPmLd-f6cPwuT8DqXA26MRpVxNiZWeuM76fW-OKFeAMGL7ClBTXe6Yf6qz-gPLWQ9dajzPmXDmV9I5TX5jHGB30CQwlyMET8Sd3DeAqDubAqAArwDGHVLajQwHT1mAAWjiPGESv4KZBBOFRUWEkao3CzjTTM2YVYFiLCWcg5ZKzVlrPWbh18EyXCWDbBYM4thpChA5dEy5TgBHXJuI4DDP7qQalpLRxDgZ2wYtZdY-54hfm+n4CWhxEzwilgxUCGdpFfwasrH2e4nHPSiDCNxxFShBDshEReCYbKLHWlRMI7iN7bFQaxSJv9YYxKEoEFeScMkxjVJveMREDjGFEXiMqiZjEFJgugwapSIHeMbmVMM-5AhTnCLCUWGR2n4JVhzbpk01SHBWq0+hkYN5pLiKLX8RFtiviOBTUotiKhAA */
  createMachine(
    {
      schema: {
        events: {} as
          | CommentsByDocumentIdQueryServiceEvent
          | { type: "CREATE_COMMENT"; text: string; from: number; to: number }
          | { type: "DELETE_COMMENT"; commentId: string }
          | { type: "UPDATE_REPLY_TEXT"; text: string; commentId: string }
          | { type: "CREATE_REPLY"; commentId: string }
          | { type: "DELETE_REPLY"; replyId: string }
          | { type: "HIGHLIGHT_COMMENT_FROM_EDITOR"; commentId: string | null }
          | { type: "HIGHLIGHT_COMMENT_FROM_SIDEBAR"; commentId: string | null }
          | {
              type: "SET_ACTIVE_SNAPSHOT_AND_COMMENT_KEYS";
              activeSnapshot: ActiveSnapshot;
              commentKeys: CommentKeys;
            }
          | { type: "OPEN_SIDEBAR" }
          | { type: "CLOSE_SIDEBAR" }
          | { type: "TOGGLE_SIDEBAR" },
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
        highlightedCommentId: null,
        commentKeys: {},
        activeSnapshot: undefined,
        isOpenSidebar: false,
      },
      initial: "waitingForActiveSnapshot",
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
        HIGHLIGHT_COMMENT_FROM_EDITOR: {
          actions: ["highlightComment"],
        },
        HIGHLIGHT_COMMENT_FROM_SIDEBAR: {
          actions: ["highlightComment"],
        },
        SET_ACTIVE_SNAPSHOT_AND_COMMENT_KEYS: {
          actions: ["setActiveSnapshotAndCommentKeys"],
        },
        OPEN_SIDEBAR: {
          actions: [assign({ isOpenSidebar: true })],
        },
        CLOSE_SIDEBAR: {
          actions: [assign({ isOpenSidebar: false })],
        },
        TOGGLE_SIDEBAR: {
          actions: [
            assign((context) => {
              if (context.isOpenSidebar) {
                return {
                  isOpenSidebar: false,
                  highlightedCommentId: null,
                };
              }
              return {
                isOpenSidebar: true,
              };
            }),
          ],
        },
      },
      states: {
        waitingForActiveSnapshot: {
          on: {
            SET_ACTIVE_SNAPSHOT_AND_COMMENT_KEYS: {
              actions: ["setActiveSnapshotAndCommentKeys"],
              target: "idle",
            },
          },
        },
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
        highlightComment: assign((context, event) => {
          return {
            highlightedCommentId: event.commentId,
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
        setActiveSnapshotAndCommentKeys: assign((context, event) => {
          return {
            activeSnapshot: event.activeSnapshot,
            commentKeys: event.commentKeys,
          };
        }),
        decryptComments: assign((context, event) => {
          const activeSnapshot = context.activeSnapshot;
          if (!activeSnapshot) return {};

          const decryptedComments =
            context.commentsByDocumentIdQueryResult?.data?.commentsByDocumentId?.nodes?.map(
              (encryptedComment) => {
                const commentKey = recreateCommentKey({
                  snapshotKey: activeSnapshot.key,
                  subkeyId: encryptedComment?.subkeyId!,
                });

                const decryptedComment = decryptComment({
                  key: commentKey.key,
                  ciphertext: encryptedComment!.contentCiphertext,
                  publicNonce: encryptedComment!.contentNonce,
                });

                const replies = encryptedComment?.commentReplies?.map(
                  (encryptedReply) => {
                    const replyKey = recreateCommentKey({
                      snapshotKey: activeSnapshot.key,
                      subkeyId: encryptedReply?.subkeyId!,
                    });

                    const decryptedReply = decryptComment({
                      key: replyKey.key,
                      ciphertext: encryptedReply!.contentCiphertext,
                      publicNonce: encryptedReply!.contentNonce,
                    });

                    return {
                      ...JSON.parse(decryptedReply),
                      id: encryptedReply!.id,
                      createdAt: encryptedReply!.createdAt,
                      creatorDevice: encryptedReply!.creatorDevice,
                    };
                  }
                );

                return {
                  ...JSON.parse(decryptedComment),
                  id: encryptedComment!.id,
                  createdAt: encryptedComment!.createdAt,
                  replies,
                  creatorDevice: encryptedComment!.creatorDevice,
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
          const activeSnapshot = context.activeSnapshot;
          if (!activeSnapshot) return undefined;

          const commentKey = createCommentKey({
            snapshotKey: activeSnapshot.key,
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
              snapshotId: activeSnapshot.id,
              subkeyId: commentKey.subkeyId,
              contentCiphertext: result.ciphertext,
              contentNonce: result.publicNonce,
            },
          });
        },
        createReply: async (context, event) => {
          const activeSnapshot = context.activeSnapshot;
          if (!activeSnapshot) return undefined;

          const replyKey = createCommentKey({
            snapshotKey: activeSnapshot.key,
          });

          const result = encryptComment({
            key: replyKey.key,
            comment: JSON.stringify({
              text: context.replyTexts[event.commentId],
            }),
          });
          return await runCreateCommentReplyMutation({
            input: {
              snapshotId: activeSnapshot.id,
              subkeyId: replyKey.subkeyId,
              commentId: event.commentId,
              contentCiphertext: result.ciphertext,
              contentNonce: result.publicNonce,
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
