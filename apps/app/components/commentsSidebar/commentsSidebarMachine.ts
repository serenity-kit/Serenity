import { KeyDerivationTrace2 } from "@naisho/core";
import {
  commentDerivedKeyContext,
  createCommentKey,
  decryptComment,
  deriveKeysFromKeyDerivationTrace,
  documentDerivedKeyContext,
  encryptComment,
  LocalDevice,
  recreateDocumentKey,
} from "@serenity-tools/common";
import { AnyActorRef, assign, createMachine, spawn } from "xstate";
import {
  CommentsByDocumentIdQueryResult,
  commentsByDocumentIdQueryService,
  CommentsByDocumentIdQueryServiceEvent,
  CommentsByDocumentIdQueryUpdateResultEvent,
  runCreateCommentMutation,
  runDeleteCommentsMutation,
} from "../../generated/graphql";
import { getDocument } from "../../utils/document/getDocument";
import { createFolderKeyDerivationTrace } from "../../utils/folder/createFolderKeyDerivationTrace";
import { deriveFolderKey } from "../../utils/folder/deriveFolderKeyData";
import { showToast } from "../../utils/toast/showToast";
import { getWorkspace } from "../../utils/workspace/getWorkspace";

type Params = {
  pageId: string;
  activeDevice: LocalDevice | null;
};

type DecryptedComment = {
  id: string;
  text: string;
};

interface Context {
  params: Params;
  commentsByDocumentIdQueryResult?: CommentsByDocumentIdQueryResult;
  commentsByDocumentIdQueryError: boolean;
  commentsByDocumentIdQueryActor?: AnyActorRef;
  decryptedComments: DecryptedComment[];
  commentText: string;
}

export const commentsSidebarMachine = createMachine(
  {
    schema: {
      events: {} as
        | CommentsByDocumentIdQueryServiceEvent
        | { type: "UPDATE_COMMENT_TEXT"; text: string }
        | { type: "CREATE_COMMENT" }
        | { type: "DELETE_COMMENT"; commentId: string },
      context: {} as Context,
    },
    tsTypes: {} as import("./commentsSidebarMachine.typegen").Typegen0,
    predictableActionArguments: true,
    context: {
      params: {
        pageId: "",
        activeDevice: null,
      },
      commentsByDocumentIdQueryError: false,
      commentText: "",
      decryptedComments: [],
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
      UPDATE_COMMENT_TEXT: {
        actions: ["updateCommentText"],
      },
    },
    states: {
      idle: {
        entry: ["spawnActors"],
        on: {
          CREATE_COMMENT: "creatingComment",
          DELETE_COMMENT: "deletingComment",
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
              actions: ["clearCommentText", "stopActors", "spawnActors"], // respawn to trigger a request,
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
    },
    id: "commentsSidebarMachine",
  },
  {
    actions: {
      showErrorToast: (context) => {
        // makes sure the error toast is only shown once
        if (!context.commentsByDocumentIdQueryError) {
          showToast("Failed to load comments.", "error");
        }
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
      clearCommentText: assign({ commentText: "" }),
      updateCommentText: assign((context, event) => {
        return {
          commentText:
            event.type === "UPDATE_COMMENT_TEXT"
              ? event.text
              : context.commentText,
        };
      }),
      decryptComments: assign((context, event) => {
        const decryptedComments =
          context.commentsByDocumentIdQueryResult?.data?.commentsByDocumentId?.nodes?.map(
            (encryptedComment) => {
              const keyDerivationTraceWithKeys =
                deriveKeysFromKeyDerivationTrace({
                  keyDerivationTrace: encryptedComment?.keyDerivationTrace!,
                  activeDevice: context.params.activeDevice!,
                  workspaceKeyBox:
                    context.commentsByDocumentIdQueryResult?.data
                      ?.workspaceKeyByDocumentId?.nameWorkspaceKey
                      .workspaceKeyBox!,
                });

              console.log(keyDerivationTraceWithKeys);

              const decryptedComment = decryptComment({
                key: keyDerivationTraceWithKeys.trace.at(-1)?.key!,
                ciphertext: encryptedComment!.encryptedContent,
                publicNonce: encryptedComment!.encryptedContentNonce,
              });
              return {
                id: encryptedComment!.id,
                ...JSON.parse(decryptedComment),
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
        const document = await getDocument({
          documentId: context.params.pageId,
        });
        const workspace = await getWorkspace({
          workspaceId: document.workspaceId!,
          deviceSigningPublicKey: context.params.activeDevice!.signingPublicKey,
        });
        const folderKeyChainData = await deriveFolderKey({
          folderId: document.parentFolderId!,
          workspaceId: document.workspaceId!,
          keyDerivationTrace: document.nameKeyDerivationTrace,
          activeDevice: context.params.activeDevice!,
        });

        const folderKey = folderKeyChainData[folderKeyChainData.length - 2];
        const documentKeyData = recreateDocumentKey({
          folderKey: folderKey.key,
          subkeyId: document.nameKeyDerivationTrace.subkeyId,
        });

        const commentKey = createCommentKey({
          documentNameKey: documentKeyData.key,
        });

        const result = encryptComment({
          key: commentKey.key,
          comment: JSON.stringify({
            text: context.commentText,
          }),
        });

        const folderKeyDerivationTrace = await createFolderKeyDerivationTrace({
          folderId: document.parentFolderId!,
          workspaceKeyId: workspace!.currentWorkspaceKey!.id,
        });

        const fullKeyDerivationTrace: KeyDerivationTrace2 = {
          ...folderKeyDerivationTrace,
          trace: [
            ...folderKeyDerivationTrace.trace,
            {
              parentId:
                folderKeyDerivationTrace.trace[
                  folderKeyDerivationTrace.trace.length - 1
                ].entryId,
              subkeyId: documentKeyData.subkeyId,
              entryId: document.id,
              context: documentDerivedKeyContext,
            },
            {
              parentId: document.id,
              subkeyId: commentKey.subkeyId,
              entryId: "TODO",
              context: commentDerivedKeyContext,
            },
          ],
        };

        return await runCreateCommentMutation({
          input: {
            documentId: context.params.pageId,
            encryptedContent: result.ciphertext,
            encryptedContentNonce: result.publicNonce,
            keyDerivationTrace: fullKeyDerivationTrace,
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
    },
    guards: {
      hasNoNetworkError: (context, event: { data: any }) => {
        return !event.data?.error?.networkError;
      },
    },
  }
);
