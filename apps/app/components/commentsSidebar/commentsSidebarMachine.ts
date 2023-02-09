import { AnyActorRef, assign, createMachine, spawn } from "xstate";
import {
  CommentsByDocumentIdQueryResult,
  commentsByDocumentIdQueryService,
  CommentsByDocumentIdQueryServiceEvent,
  CommentsByDocumentIdQueryUpdateResultEvent,
  runCreateCommentMutation,
} from "../../generated/graphql";
import { showToast } from "../../utils/toast/showToast";

type Params = {
  pageId: string;
};

interface Context {
  params: Params;
  commentsByDocumentIdQueryResult?: CommentsByDocumentIdQueryResult;
  commentsByDocumentIdQueryError: boolean;
  commentsByDocumentIdQueryActor?: AnyActorRef;
}

export const commentsSidebarMachine = createMachine(
  {
    schema: {
      events: {} as
        | CommentsByDocumentIdQueryServiceEvent
        | { type: "CREATE_COMMENT" },
      context: {} as Context,
    },
    tsTypes: {} as import("./commentsSidebarMachine.typegen").Typegen0,
    predictableActionArguments: true,
    context: {
      params: {
        pageId: "",
      },
      commentsByDocumentIdQueryError: false,
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
        ],
      },
      "CommentsByDocumentIdQuery.ERROR": {
        actions: [
          "showErrorToast",
          assign({ commentsByDocumentIdQueryError: true }),
        ],
      },
    },
    states: {
      idle: {
        entry: ["spawnActors"],
        on: { CREATE_COMMENT: "creatingComment" },
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
      spawnActors: assign((context) => {
        return {
          commentsByDocumentIdQueryActor: spawn(
            commentsByDocumentIdQueryService(
              { documentId: context.params.pageId },
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
    },
    services: {
      createComment: (context, event) => {
        console.log("event", event);
        return runCreateCommentMutation({
          input: {
            documentId: context.params.pageId,
            encryptedContent: "encryptedContent",
            encryptedContentNonce: "encryptedContentNonce",
            contentKeyDerivationTrace: {
              workspaceKeyId: "workspaceKeyId",
              subkeyId: 42,
              parentFolders: [
                {
                  folderId: "folderId",
                  subkeyId: 42,
                },
              ],
            },
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
