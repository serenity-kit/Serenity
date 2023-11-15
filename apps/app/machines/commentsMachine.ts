import {
  Device,
  LocalDevice,
  createCommentKey,
  encryptAndSignComment,
  encryptAndSignCommentReply,
  notNull,
  recreateCommentKey,
  verifyAndDecryptComment,
  verifyAndDecryptCommentReply,
} from "@serenity-tools/common";
import sodium from "react-native-libsodium";
import { AnyActorRef, assign, createMachine, spawn } from "xstate";
import * as Yjs from "yjs";
import {
  CommentsByDocumentIdQueryResult,
  CommentsByDocumentIdQueryServiceEvent,
  CommentsByDocumentIdQueryUpdateResultEvent,
  commentsByDocumentIdQueryService,
  runCreateCommentMutation,
  runCreateCommentReplyMutation,
  runDeleteCommentRepliesMutation,
  runDeleteCommentsMutation,
} from "../generated/graphql";
import { showToast } from "../utils/toast/showToast";

type Params = {
  // these won't change
  pageId: string;
  shareLinkToken?: string;
  activeDevice: LocalDevice | null;
};

export type DecryptedReply = {
  id: string;
  text: string;
  createdAt: string;
  creatorDevice: Device;
};

export type DecryptedComment = {
  id: string;
  text: string;
  from: any;
  to: any;
  replies: DecryptedReply[];
  createdAt: string;
  creatorDevice: Device;
};

type HighlightedCommentSource = "editor" | "sidebar";

type HighlightedComment = { id: string; source: HighlightedCommentSource };

export type YCommentKeys = Yjs.Map<Uint8Array>;
export type YCommentReplyKeys = Yjs.Map<Uint8Array>;

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
  highlightedComment: HighlightedComment | null;
  activeSnapshot: ActiveSnapshot | undefined;
  yCommentKeys: YCommentKeys;
  yCommentReplyKeys: YCommentReplyKeys;
  isOpenSidebar: boolean;
}

export const commentsMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QGMD2BbdYB2AXWAsgIbIAWAltmAMQDCGWesAQgJ4AiqyAro7gJIQAitzAAnVgDoAqgAV2AQQAqAUQD6AJRUBlaQBklAbQAMAXUSgADqljlc5VNgsgAHogDMANgAckgEyeAJwArH7B7n4A7JHu3gA0IKyI3sbGkt4AjH4ALJ7BntmBmdnuAL6lCWiYOPjEZJQ09NVMbJw8fIIi4lIqGhoA8hom5kgg1rb2js5uCNnG2el+S7Huxn4Z3pHBCUkInpG+gX7uGe5e6+uR2eWVDDWEJBRU1HKKqpoqsnoAmmqqABpGMzOcZ2BxOUYzXKRSRHbLZA4pOGeYyRHaIYLedySAreOZraHBA43EBVPgPerPAAS-AA4lS9HSqUo1LR+gQCCoAHIsgBiAwIahU7H4SkGwxBNjBU0hiDmnkkMU8XmMwVV2RSwW2iTl3l87iVnh8kSWRQy1wqpLuTDqTxoNPpjPpLLZHO5fIFam0-HYKmYCiGwNGoMmENAULWkmMESJ+LWy3RCHcgWxxiKKfchQOsWCJLJ91tDWo2hULIUtCU-AAauptFyFLJtFT+mWuexWezOTy1ABpFTfbQS4NS0PTDyRDKSErRjJHWJZNPZRN+QIw7w5PypLJnA6BPPW2qPIv9WTcr0+v0BodWEfgsezQJpbJE+bR6PZTfuZeR4KFXL7DVAlnAJ92aQ9KUaPR+hLc9fX9QMRhvCY71lWZvAVTxZ3NGIvGfdclx1BAMlRfwrhwg14WCQJlVA8lC2eMVaVpPRawveDrzGW8ZXDXU0kyLEtVOWdf3mRMslogsjyoSQAHciDBbAoF5VAxAUZB7AANzAbRsCISxYFIVBcGLUs1HLSsay9etG2bVt21dLsWT7AcOJDFCeNmc0owyDJImMDJwm8FMEUTQJVyjHIjRiREzQkm0pLASRyAgAAbRotGUdQHPdVyuLDVxEE8TdJDOCIQmjc54kI2c8lhVESj8PFAizbw4vAu0ktSmhfRY95sp5XLkO4gq9iWEqshKDIgiuOYCN2KbMSjaiTlWbJiNCVrLXzeKIM6tK6Ay94tC+b5BulfKZjybFM0ifYDVSLEgOXVY0lK4SsXNeE2opDrkv2nrS3UY6fjO0dULyYISoCTJowKPIArEtM-H8ML8S2M4iU224wJ+hpJAgMA0vsRSmj4agIEcRLKA01AAGtEoJomwFJmpQfcka1oWfzfP8wLgrRar8UkHzVRiXytWo3MtoPXHpMZsBiagFm8HJymkuwGn6fxwmFeZg9DAyRDOKGi65S87m-IC2J+bE4INlhIoqMxZ9Re++iGZ1xXleM8QxBUyRLBSohcAAMxU9BtaZ722eGqFzZ8y2+Zu23avXRqkROFdqLdhLI4VygoA0MBA9YVXpOpumPaZouS5j03PK5hPeet5PqvNZGJr1KjjmCnPdvlxWa5S0uKfLjXK7z3AwCH1gDaNtzY7NxueatoLW-mgJJ38ldjG8KizmaqXsbo3OB4LmfqF9-3A+DsOxAjgfp+L4e6-vTnvJXpOQuq1Y1wNc1iJ5DxO4I+Vocbu0kMgMQYBg4F29mXKm48tZQJgVPaOQYkLnTfvHT+Ldv7zT8jCI4vkijrCmiuMo0twG5xQbAkmB4EHq01olWhaD9aG0lCbbBy9E54IFvNdcCokTrl3jDIKWMwEn12qwuBDCr5iADkHUO4dIHQODnrMCr9ULvwts3Ne+DEAbBiDiTMqRUTJhmhI7a7U8YyMUhfUeiDmGqNQU-WuGDjZYO0Tg3h+j+GIE3AFRUZw1gmmapsGIfcOp2MLs-EeasK7ILUVPGec9OFeI8jopuq8baEXWJhfwICCiqhyPMcIUTbHJPPnEy+Yg-YKJvso++Lj1GpI8QveuWTcF+OXJuXwqpVzKhNFNIC5RLTYFQATeAoxrGyzAOksGHkAC0GRQppkVP5W64RUhBF8hU6SckFJKRUmpTS2ldL6UMrgBZ7MZjmmxHqFIAQGqrkfH4RGs5YS+TCJEaie8th7ioVI36XUbmLwQEFGEVwLjUW3GEMSypkaZhCDkM465vn7KrvnehYEwWdKIcqDagk0wrTmoYkoRDHzRFnOVaImLJ7VJLni+8YUUaZABZseExEvzVRJcLDUpjwj7HEkCyS0iqk4r4My7R-iiJXEhk8-yKRbpFS2PSmJM9pUeSKCVTMmE1SYiKv878RpYSbkKJsFcKRNrlCAA */
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
          | {
              type: "HIGHLIGHT_COMMENT_FROM_EDITOR";
              commentId: string | null;
              openSidebar: boolean;
            }
          | { type: "HIGHLIGHT_COMMENT_FROM_SIDEBAR"; commentId: string | null }
          | {
              type: "SET_ACTIVE_SNAPSHOT_AND_COMMENT_KEYS";
              activeSnapshot: ActiveSnapshot;
              yCommentKeys: YCommentKeys;
              yCommentReplyKeys: YCommentReplyKeys;
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
        highlightedComment: null,
        // just to fulfill the types
        yCommentKeys: new Yjs.Doc().getMap<Uint8Array>("commentKeys"),
        // just to fulfill the types
        yCommentReplyKeys: new Yjs.Doc().getMap<Uint8Array>("commentReplyKeys"),
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
            "verifyAndDecryptComments",
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
          actions: ["setActiveSnapshotAndCommentAndReplyKeys"],
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
                  highlightedComment: null,
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
              actions: ["setActiveSnapshotAndCommentAndReplyKeys"],
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
                  documentShareLinkToken: context.params.shareLinkToken,
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
          if (event.commentId) {
            return {
              isOpenSidebar:
                event.type === "HIGHLIGHT_COMMENT_FROM_EDITOR" &&
                event.openSidebar
                  ? true
                  : context.isOpenSidebar,
              highlightedComment: {
                id: event.commentId,
                source: (event.type === "HIGHLIGHT_COMMENT_FROM_SIDEBAR"
                  ? "sidebar"
                  : "editor") as HighlightedCommentSource,
              },
            };
          }
          return {
            highlightedComment: null,
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
        setActiveSnapshotAndCommentAndReplyKeys: assign((context, event) => {
          return {
            activeSnapshot: event.activeSnapshot,
            yCommentKeys: event.yCommentKeys,
            yCommentReplyKeys: event.yCommentReplyKeys,
          };
        }),
        verifyAndDecryptComments: assign((context, event) => {
          const activeSnapshot = context.activeSnapshot;
          if (!activeSnapshot) return {};

          if (
            !context.commentsByDocumentIdQueryResult?.data?.commentsByDocumentId
              ?.nodes
          )
            return {
              decryptedComments: [],
            };

          // console.log("yCommentKeys", context.yCommentKeys.size);
          // context.yCommentKeys.forEach((key, commentId) => {
          //   console.log("commentId", commentId, key);
          // });
          // console.log("yCommentReplyKeys", context.yCommentKeys.size);
          // context.yCommentReplyKeys.forEach((key, commentId) => {
          //   console.log("commentReplyId", commentId, key);
          // });

          const decryptedComments =
            context.commentsByDocumentIdQueryResult.data.commentsByDocumentId.nodes
              .filter(notNull)
              .map((encryptedComment) => {
                let commentKey: string;
                const maybeCommentKey = context.yCommentKeys.get(
                  encryptedComment.id
                );
                if (encryptedComment.snapshotId === activeSnapshot.id) {
                  const recreatedCommentKey = recreateCommentKey({
                    snapshotKey: activeSnapshot.key,
                    subkeyId: encryptedComment.subkeyId,
                  });
                  commentKey = recreatedCommentKey.key;
                  // key is missing in the yjs document so we add it
                  // this is the case in case the comment was produced by
                  // a user with the role commenter who doesn't have write
                  // access to the document
                  if (!maybeCommentKey) {
                    context.yCommentKeys.set(
                      encryptedComment.id,
                      sodium.from_base64(commentKey)
                    );
                  }
                } else {
                  if (!maybeCommentKey) {
                    throw new Error("No comment key found.");
                  }
                  commentKey = sodium.to_base64(maybeCommentKey);
                }

                const decryptedComment = verifyAndDecryptComment({
                  commentId: encryptedComment.id,
                  key: commentKey,
                  ciphertext: encryptedComment.contentCiphertext,
                  nonce: encryptedComment.contentNonce,
                  authorSigningPublicKey:
                    encryptedComment.creatorDevice.signingPublicKey,
                  documentId: context.params.pageId,
                  signature: encryptedComment.signature,
                  snapshotId: encryptedComment.snapshotId,
                  subkeyId: encryptedComment.subkeyId,
                });

                const replies = encryptedComment.commentReplies
                  ? encryptedComment.commentReplies
                      .filter(notNull)
                      .map((encryptedReply) => {
                        let replyKey: string;
                        const maybeReplyKey = context.yCommentReplyKeys.get(
                          encryptedReply.id
                        );
                        if (encryptedReply.snapshotId === activeSnapshot.id) {
                          const recreatedReplyKey = recreateCommentKey({
                            snapshotKey: activeSnapshot.key,
                            subkeyId: encryptedReply.subkeyId,
                          });
                          replyKey = recreatedReplyKey.key;
                          // key is missing in the yjs document so we add it
                          // this is the case in case the comment was produced by
                          // a user with the role commenter who doesn't have write
                          // access to the document
                          if (!maybeReplyKey) {
                            context.yCommentReplyKeys.set(
                              encryptedReply.id,
                              sodium.from_base64(replyKey)
                            );
                          }
                        } else {
                          if (!maybeReplyKey) {
                            throw new Error("No comment reply key found.");
                          }
                          replyKey = sodium.to_base64(maybeReplyKey);
                        }

                        const decryptedReply = verifyAndDecryptCommentReply({
                          key: replyKey,
                          ciphertext: encryptedReply.contentCiphertext,
                          nonce: encryptedReply.contentNonce,
                          commentId: encryptedComment.id,
                          commentReplyId: encryptedReply.id,
                          authorSigningPublicKey:
                            encryptedReply.creatorDevice.signingPublicKey,
                          documentId: context.params.pageId,
                          signature: encryptedReply.signature,
                          snapshotId: encryptedReply.snapshotId,
                          subkeyId: encryptedReply.subkeyId,
                        });

                        return {
                          ...decryptedReply,
                          id: encryptedReply.id,
                          createdAt: encryptedReply.createdAt,
                          creatorDevice: encryptedReply.creatorDevice,
                        };
                      })
                  : [];

                return {
                  ...decryptedComment,
                  id: encryptedComment.id,
                  createdAt: encryptedComment.createdAt,
                  replies,
                  creatorDevice: encryptedComment.creatorDevice,
                };
              });

          return {
            decryptedComments,
          };
        }),
      },
      services: {
        createComment: async (context, event) => {
          try {
            const activeSnapshot = context.activeSnapshot;
            if (!activeSnapshot) return undefined;
            const activeDevice = context.params.activeDevice;
            if (!activeDevice) {
              throw new Error("No active device.");
            }

            const commentKey = createCommentKey({
              snapshotKey: activeSnapshot.key,
            });

            const result = encryptAndSignComment({
              key: commentKey.key,
              text: event.text,
              from: event.from,
              to: event.to,
              device: activeDevice,
              documentId: context.params.pageId,
              snapshotId: activeSnapshot.id,
              subkeyId: commentKey.subkeyId,
            });

            const createCommentMutationResult = await runCreateCommentMutation({
              input: {
                commentId: result.commentId,
                snapshotId: activeSnapshot.id,
                subkeyId: commentKey.subkeyId,
                contentCiphertext: result.ciphertext,
                contentNonce: result.nonce,
                signature: result.signature,
              },
            });
            // this adds the comment key to the Yjs document
            context.yCommentKeys.set(
              result.commentId,
              sodium.from_base64(commentKey.key)
            );
            return createCommentMutationResult;
          } catch (err) {
            console.error(err);
            throw err;
          }
        },
        createReply: async (context, event) => {
          const activeSnapshot = context.activeSnapshot;
          if (!activeSnapshot) return undefined;
          const activeDevice = context.params.activeDevice;
          if (!activeDevice) {
            throw new Error("No active device.");
          }

          const replyKey = createCommentKey({
            snapshotKey: activeSnapshot.key,
          });

          const result = encryptAndSignCommentReply({
            key: replyKey.key,
            commentId: event.commentId,
            text: context.replyTexts[event.commentId],
            device: activeDevice,
            documentId: context.params.pageId,
            snapshotId: activeSnapshot.id,
            subkeyId: replyKey.subkeyId,
          });
          const createCommentReplyMutation =
            await runCreateCommentReplyMutation({
              input: {
                snapshotId: activeSnapshot.id,
                subkeyId: replyKey.subkeyId,
                commentId: event.commentId,
                contentCiphertext: result.ciphertext,
                contentNonce: result.nonce,
                commentReplyId: result.commentReplyId,
                signature: result.signature,
              },
            });
          // this adds the comment key to the Yjs document
          context.yCommentReplyKeys.set(
            result.commentReplyId,
            sodium.from_base64(replyKey.key)
          );
          return createCommentReplyMutation;
        },
        deleteComment: async (context, event) => {
          const deleteCommentsMutationResult = await runDeleteCommentsMutation({
            input: { commentIds: [event.commentId] },
          });
          context.yCommentKeys.delete(event.commentId);
          return deleteCommentsMutationResult;
        },
        deleteReply: async (context, event) => {
          const deleteCommentReplyMutationResult =
            await runDeleteCommentRepliesMutation({
              input: { commentReplyIds: [event.replyId] },
            });
          context.yCommentReplyKeys.delete(event.replyId);
          return deleteCommentReplyMutationResult;
        },
      },
      guards: {
        hasNoNetworkError: (context, event: { data: any }) => {
          return !event.data?.error?.networkError;
        },
      },
    }
  );
