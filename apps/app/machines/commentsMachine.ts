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
import {
  AnyActorRef,
  assertEvent,
  assign,
  fromPromise,
  setup,
  stopChild,
} from "xstate";
import * as Yjs from "yjs";
import {
  CommentsByDocumentIdQueryResult,
  CommentsByDocumentIdQueryServiceEvent,
  commentsByDocumentIdQueryService,
  runCreateCommentMutation,
  runCreateCommentReplyMutation,
  runDeleteCommentRepliesMutation,
  runDeleteCommentsMutation,
} from "../generated/graphql";
import {
  getLocalOrLoadRemoteWorkspaceMemberDevicesProofQueryByHash,
  loadRemoteWorkspaceMemberDevicesProofQuery,
} from "../store/workspaceMemberDevicesProofStore";
import { isValidDeviceSigningPublicKey } from "../utils/isValidDeviceSigningPublicKey/isValidDeviceSigningPublicKey";
import { showToast } from "../utils/toast/showToast";

type Input = {
  // these won't change
  workspaceId: string;
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
  params: Input;
  commentsByDocumentIdQueryResult?: CommentsByDocumentIdQueryResult;
  commentsByDocumentIdQueryError: boolean;
  commentsByDocumentIdQueryService?: AnyActorRef;
  decryptedComments: DecryptedComment[];
  replyTexts: Record<string, string>;
  highlightedComment: HighlightedComment | null;
  activeSnapshot: ActiveSnapshot | undefined;
  yCommentKeys: YCommentKeys;
  yCommentReplyKeys: YCommentReplyKeys;
  isOpenSidebar: boolean;
}

export const commentsMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QGMD2BbdYB2AXWAsgIbIAWAltmAMQDCGWesAQgJ4AiqyAro7gJIQAitzAAnVgDoAqgAV2AQQAqAUQD6AJRUBlaQBklAbQAMAXUSgADqljlc5VNgsgAHogDMANgAckgEyeAJwArD7Bwd4A7Mbu7gA0IKyI3sbGkt4AjH4ALMae7n7RfgEAviUJaJg4+MRklDT0VUxsnDx8giLiUioaGgDyGibmSCDWtvaOzm4IudnpxYXe2dnBfhkZ2QlJCJ6RvoF+7saRGZ4ZS96efmUVDNWEJBRU1HKKqpoqsnoAmmqqABpGMzOMZ2BxOEbTbK7SQHZaRHLGULRYJbRARdySTzZbyxQoBbIbDI3ECVPgPOrPAAS-AA4lS9HSqUo1LQ+gQCCoAHIsgBi-QIahU7H4SgGQxBNjBk0hiFynkkkS87gygRxB0CWVRiTl3l87iVwUC7lx2Xc2T8SJJZPutSeNBp9MZ9JZbI53L5ArU2n47BUzAUg2BI1BEwhoChxj8khiflCfhCARy3jRCHcxpjgT1wWyauKQUC1ruTDt9Wo2hULIUtCU-AAauptFyFLJtFS+lWuexWezOTy1ABpFTfbQSkNSsNTDwnSRmmLponrEKphORea5SLBSKBQLbqNFpo1R5lvqybne33+wNjqwT8FTmaBNIraIFbyBfJHTwrqOSHPG3FLk8VYfAPclS2eWg9D6CsLz9AMg2GW9xnvWUZkuLFVQyUIc0OHFPG-HUEAyY5-EiaFNWNAp8myMDbWPZ4xVpWk9EbS8EJvUY7xlCNdTSTJcXCKMzQOSJUyyOiSwYsBJAAdyIMFsCgXlUDEBRkHsAA3MBtGwIhLFgUhUFwctKzUatawbb1m1bdtO27N0+xZIcR040NUN4mYNhjdYTmTD9gJTIidzXYSjRSYxvDWApJKPSkZPICAABsGi0ZR1Ecj03O48NXEQK40liPEn1jaExKI1VgNhY5LSi5YUmCYlylJYs4vtSREpS6g-VY95Mp5bKUJ4vKdmKSQVWTDI9izdNyu2U4IkzTwo3cUJsVCdxYopdrOtSlR0o+L5vkG6VcumYDMXNSJgMREi9TmxBDlScbYhiUIswtAitoghLkpoHrK3ULQjpOyc0OA4JxoCBrzmuzIHuI4wDn8HcDROYI8g1b7pMkCAwBS+wlMaPhqAgRwEuwTTUAAaxkvGCbAYnqlBjyRsJOZjF8rJ1QIiJxNyNJ1mMbI-OAq4Rex+LcfxsBCagJm8FJ8mOspmm6Zl3BGdawwMiQrihrOuVvM5qbuffXmgvmxr9g+3Y4wiK1mptKSpfp2XKHl1rqHEMRVMkSwkqIXAADNVPQaWGYV3AWeGqFja5-yLfEnD5jjXENkOApCyd1rtvqCP3aUjQwAD1glaoFWqdpgvNeL0uY8NryOYTnnAvEjPJDNlVN3Ca7Ikl9q3bluukrLsmK8oKv1YZkfWB1vX3Njo3m9NxO24qgIMh8vwosicity3Af86Hj3Z+9sRfbEf3A5DsOa7AWeG4fdmfNX1u+Yqo411xV9IsJDGmq3EPHnCuyAxBgCDh7KO5cKZT0kGAiBmso5PzQi-E2fl36W0QFNUiBxsIXQamtI+oDwGQKJl7cesC1bwNIUg7WutJQG2fvHN+5t17zSigqFIapyKnGwpaYIxCZIILIZ7Q859L7XyDqHMQ4cRF0MPCgzyaCW5sI-hwpUWJYh9yinkTItEc7AJ+jQxBp8S6jxgZXah8iH7mLnsGZCp1mErwwWorBCBLTYUVAUTcqQIhPkEYY8CON5FmNLpYye1jaG2Prgw8cTDUEsNcQFdRj0+H+FWkcPhjULRCJMaIs+Ps-YB2kXfGxj8HH6ycYklxZsUnuOKJFGMRoWmFDnJtEk2BUB43gCMZ2bV6iMOqZ5AAtBkVMT5AiKk5rwt64R3x5PkopZSql1JaR0npAyRlcBDLBp5DYmI9QpBwWaXemwKqcymZqE4ap-54WzkA4JUtdq7NZtMd8a5yJrD2BaTIO53GnAKONXMAQjQJgmgYx59FXYayga1V5S8Zhrg-KtXYeDgLbnCPzA0sIny7AIqC5a3g8knyLnYhFjcdwo0yEaF8BQ8TiSRpiDY6dzjnCzHkPJoTyGHgpc-BGU0VjpBmZFTJXhAEtSMSE2hYTR58rQlmF60IViWh3puNYP4CKwlVRsQkxpoRlDKEAA */
  setup({
    types: {} as {
      context: Context;
      input: Input;
      events:
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
        | { type: "TOGGLE_SIDEBAR" };
      children: {
        commentsByDocumentIdQueryService: "commentsByDocumentIdQueryService";
      };
    },
    actions: {
      showErrorToast: ({ context }) => {
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
      spawnActors: assign(({ context, spawn }) => {
        return {
          commentsByDocumentIdQueryService: spawn(
            "commentsByDocumentIdQueryService",
            {
              id: "commentsByDocumentIdQueryService",
              input: {
                variables: {
                  documentId: context.params.pageId,
                  documentShareLinkToken: context.params.shareLinkToken,
                },
                intervalInMs: 10000, // poll only every 10 seconds
              },
            }
          ),
        };
      }),
      stopActors: ({ context }) => {
        stopChild("commentsByDocumentIdQueryService");
      },
      updateReplyText: assign(({ context, event }) => {
        assertEvent(event, "UPDATE_REPLY_TEXT");
        return {
          replyTexts: {
            ...context.replyTexts,
            [event.commentId]: event.text,
          },
        };
      }),
      highlightComment: assign(({ context, event }) => {
        assertEvent(event, [
          "HIGHLIGHT_COMMENT_FROM_EDITOR",
          "HIGHLIGHT_COMMENT_FROM_SIDEBAR",
        ]);

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
      clearReplyText: assign(({ context, event }) => {
        // @ts-expect-error event is not typed
        if (event.output.data.createCommentReply.commentReply.commentId) {
          return {
            replyTexts: {
              ...context.replyTexts,
              // @ts-expect-error event is not typed
              [event.output.data.createCommentReply.commentReply.commentId]: "",
            },
          };
        } else {
          return {};
        }
      }),
      setActiveSnapshotAndCommentAndReplyKeys: assign(({ event }) => {
        assertEvent(event, "SET_ACTIVE_SNAPSHOT_AND_COMMENT_KEYS");
        return {
          activeSnapshot: event.activeSnapshot,
          yCommentKeys: event.yCommentKeys,
          yCommentReplyKeys: event.yCommentReplyKeys,
        };
      }),
    },
    actors: {
      commentsByDocumentIdQueryService: commentsByDocumentIdQueryService,
      verifyAndDecryptComments: fromPromise(
        async ({ input: context }: { input: Context }) => {
          let decryptedComments: DecryptedComment[] = [];
          const activeSnapshot = context.activeSnapshot;
          if (!activeSnapshot) return [];

          if (
            !context.commentsByDocumentIdQueryResult?.data?.commentsByDocumentId
              ?.nodes
          )
            return decryptedComments;

          // console.log("yCommentKeys", context.yCommentKeys.size);
          // context.yCommentKeys.forEach((key, commentId) => {
          //   console.log("commentId", commentId, key);
          // });
          // console.log("yCommentReplyKeys", context.yCommentKeys.size);
          // context.yCommentReplyKeys.forEach((key, commentId) => {
          //   console.log("commentReplyId", commentId, key);
          // });

          decryptedComments = await Promise.all(
            context.commentsByDocumentIdQueryResult.data.commentsByDocumentId.nodes
              .filter(notNull)
              .map(async (encryptedComment) => {
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

                const workspaceMemberDevicesProof =
                  await getLocalOrLoadRemoteWorkspaceMemberDevicesProofQueryByHash(
                    {
                      workspaceId: context.params.workspaceId,
                      hash: encryptedComment.workspaceMemberDevicesProofHash,
                      documentShareLinkToken: context.params.shareLinkToken,
                    }
                  );
                if (!workspaceMemberDevicesProof) {
                  throw new Error(
                    "workspaceMemberDevicesProof for decrypting a comment is not found"
                  );
                }

                // this check should not be done if a shareLinkToken is provided because a share link user does not have access to the workspaceChain
                if (!context.params.shareLinkToken) {
                  const isValid = isValidDeviceSigningPublicKey({
                    signingPublicKey:
                      encryptedComment.creatorDevice.signingPublicKey,
                    workspaceMemberDevicesProofEntry:
                      workspaceMemberDevicesProof,
                    workspaceId: context.params.workspaceId,
                    minimumRole: "COMMENTER",
                  });
                  if (!isValid) {
                    throw new Error(
                      "Invalid signing public key for the workspaceMemberDevicesProof"
                    );
                  }
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
                  workspaceMemberDevicesProof:
                    workspaceMemberDevicesProof.proof,
                });

                const replies = encryptedComment.commentReplies
                  ? await Promise.all(
                      encryptedComment.commentReplies
                        .filter(notNull)
                        .map(async (encryptedReply) => {
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

                          const workspaceMemberDevicesProof =
                            await getLocalOrLoadRemoteWorkspaceMemberDevicesProofQueryByHash(
                              {
                                workspaceId: context.params.workspaceId,
                                hash: encryptedReply.workspaceMemberDevicesProofHash,
                                documentShareLinkToken:
                                  context.params.shareLinkToken,
                              }
                            );
                          if (!workspaceMemberDevicesProof) {
                            throw new Error(
                              "workspaceMemberDevicesProof for decrypting a comment is not found"
                            );
                          }

                          // this check should not be done if a shareLinkToken is provided because a share link user does not have access to the workspaceChain
                          if (!context.params.shareLinkToken) {
                            const isValid = isValidDeviceSigningPublicKey({
                              signingPublicKey:
                                encryptedReply.creatorDevice.signingPublicKey,
                              workspaceMemberDevicesProofEntry:
                                workspaceMemberDevicesProof,
                              workspaceId: context.params.workspaceId,
                              minimumRole: "COMMENTER",
                            });
                            if (!isValid) {
                              throw new Error(
                                "Invalid signing public key for the workspaceMemberDevicesProof"
                              );
                            }
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
                            workspaceMemberDevicesProof:
                              workspaceMemberDevicesProof.proof,
                          });

                          return {
                            ...decryptedReply,
                            id: encryptedReply.id,
                            createdAt: encryptedReply.createdAt,
                            creatorDevice: encryptedReply.creatorDevice,
                          };
                        })
                    )
                  : [];

                return {
                  ...decryptedComment,
                  id: encryptedComment.id,
                  createdAt: encryptedComment.createdAt,
                  replies,
                  creatorDevice: encryptedComment.creatorDevice,
                };
              })
          );

          return decryptedComments;
        }
      ),
      createComment: fromPromise(
        async ({ input }: { input: { event: any; context: Context } }) => {
          const { event, context } = input;
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

            const workspaceMemberDevicesProof =
              await loadRemoteWorkspaceMemberDevicesProofQuery({
                workspaceId: context.params.workspaceId,
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
              workspaceMemberDevicesProof: workspaceMemberDevicesProof.proof,
            });

            const createCommentMutationResult = await runCreateCommentMutation({
              input: {
                commentId: result.commentId,
                snapshotId: activeSnapshot.id,
                subkeyId: commentKey.subkeyId,
                contentCiphertext: result.ciphertext,
                contentNonce: result.nonce,
                signature: result.signature,
                workspaceMemberDevicesProofHash:
                  workspaceMemberDevicesProof.proof.hash,
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
        }
      ),
      createReply: fromPromise(
        async ({ input }: { input: { event: any; context: Context } }) => {
          const { event, context } = input;
          const activeSnapshot = context.activeSnapshot;
          if (!activeSnapshot) return undefined;
          const activeDevice = context.params.activeDevice;
          if (!activeDevice) {
            throw new Error("No active device.");
          }

          const replyKey = createCommentKey({
            snapshotKey: activeSnapshot.key,
          });

          const workspaceMemberDevicesProof =
            await loadRemoteWorkspaceMemberDevicesProofQuery({
              workspaceId: context.params.workspaceId,
            });

          const result = encryptAndSignCommentReply({
            key: replyKey.key,
            commentId: event.commentId,
            text: context.replyTexts[event.commentId],
            device: activeDevice,
            documentId: context.params.pageId,
            snapshotId: activeSnapshot.id,
            subkeyId: replyKey.subkeyId,
            workspaceMemberDevicesProof: workspaceMemberDevicesProof.proof,
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
                workspaceMemberDevicesProofHash:
                  workspaceMemberDevicesProof.proof.hash,
              },
            });
          // this adds the comment key to the Yjs document
          context.yCommentReplyKeys.set(
            result.commentReplyId,
            sodium.from_base64(replyKey.key)
          );
          return createCommentReplyMutation;
        }
      ),
      deleteComment: fromPromise(
        async ({ input }: { input: { event: any; context: Context } }) => {
          const { event, context } = input;
          const deleteCommentsMutationResult = await runDeleteCommentsMutation({
            input: { commentIds: [event.commentId] },
          });
          context.yCommentKeys.delete(event.commentId);
          return deleteCommentsMutationResult;
        }
      ),
      deleteReply: fromPromise(
        async ({ input }: { input: { event: any; context: Context } }) => {
          const { event, context } = input;
          const deleteCommentReplyMutationResult =
            await runDeleteCommentRepliesMutation({
              input: { commentReplyIds: [event.replyId] },
            });
          context.yCommentReplyKeys.delete(event.replyId);
          return deleteCommentReplyMutationResult;
        }
      ),
    },
    guards: {
      hasNoNetworkError: ({ event }) => {
        // @ts-expect-error event is not typed
        return !event.output?.error?.networkError;
      },
    },
  }).createMachine({
    context: ({ input }) => ({
      params: {
        pageId: input.pageId,
        activeDevice: input.activeDevice,
        workspaceId: input.workspaceId,
        shareLinkToken: input.shareLinkToken,
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
    }),
    initial: "waitingForActiveSnapshot",
    on: {
      "CommentsByDocumentIdQuery.UPDATE_RESULT": {
        actions: [
          assign(({ event }) => {
            return {
              commentsByDocumentIdQueryError: false,
              commentsByDocumentIdQueryResult: event.result,
            };
          }),
        ],
        target: ".decryptingComments",
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
          assign(({ context }) => {
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
            target: "startFetching",
          },
        },
      },
      startFetching: {
        entry: ["spawnActors"],
        always: {
          target: "idle",
        },
      },
      idle: {
        on: {
          CREATE_COMMENT: "creatingComment",
          DELETE_COMMENT: "deletingComment",
          CREATE_REPLY: "creatingReply",
          DELETE_REPLY: "deletingReply",
        },
      },
      decryptingComments: {
        invoke: {
          src: "verifyAndDecryptComments",
          id: "verifyAndDecryptComments",
          input: ({ context }) => context,
          onDone: {
            target: "idle",
            actions: assign(({ event }) => {
              return {
                decryptedComments: event.output,
              };
            }),
          },
          onError: {
            actions: ["showErrorToast"],
            target: "idle",
          },
        },
      },
      deletingComment: {
        invoke: {
          src: "deleteComment",
          id: "deleteComment",
          input: ({ context, event }) => {
            return { context, event };
          },
          onDone: [
            {
              actions: ["stopActors", "spawnActors"], // respawn to trigger a request,
              guard: "hasNoNetworkError",
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
          input: ({ context, event }) => {
            return { context, event };
          },
          onDone: [
            {
              actions: ["stopActors", "spawnActors"], // respawn to trigger a request,
              guard: "hasNoNetworkError",
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
          input: ({ context, event }) => {
            return { context, event };
          },
          onDone: [
            {
              actions: ["stopActors", "spawnActors"], // respawn to trigger a request,
              guard: "hasNoNetworkError",
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
          input: ({ context, event }) => {
            return { context, event };
          },
          onDone: [
            {
              actions: ["clearReplyText", "stopActors", "spawnActors"], // respawn to trigger a request,
              guard: "hasNoNetworkError",
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
  });
