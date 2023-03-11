import { Extension } from "@tiptap/core";
import { EditorState, Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import {
  relativePositionToAbsolutePosition,
  ySyncPluginKey,
} from "y-prosemirror";
import * as Y from "yjs";
import { EditorComment, HighlightedComment } from "../../types";

export interface CommentsExtensionOptions {
  comments: EditorComment[];
  yDoc: Y.Doc;
  highlightComment: (commentId: string | null, openSidebar: boolean) => void;
  highlightedComment: HighlightedComment | null;
}

type CommentsExtensionStorage = {
  comments: EditorComment[];
  yDoc: Y.Doc;
  highlightComment: (commentId: string | null, openSidebar: boolean) => void;
  highlightedComment: HighlightedComment | null;
  highlightedCommentFromPos: number | null;
};

// inspired by https://stackoverflow.com/a/46700791
export function notNull<TypeValue>(
  value: TypeValue | null
): value is TypeValue {
  return value !== null;
}

const resolveCommentPositions = (
  comments: EditorComment[],
  state: EditorState,
  yDoc: Y.Doc
) => {
  const ystate = ySyncPluginKey.getState(state);
  const { type, binding } = ystate;
  if (!binding) return [];

  return comments
    .map((comment: EditorComment) => {
      const from = relativePositionToAbsolutePosition(
        yDoc,
        type,
        comment.from,
        binding.mapping
      );
      const to = relativePositionToAbsolutePosition(
        yDoc,
        type,
        comment.to,
        binding.mapping
      );
      if (from === null || to === null) return null;
      return {
        ...comment,
        absoluteFrom: from,
        absoluteTo: to,
      };
    })
    .filter(notNull);
};

const createCommentsDecorationSet = (
  comments: (EditorComment & { absoluteFrom: number; absoluteTo: number })[],
  highlightedComment: HighlightedComment | null,
  state: EditorState,
  editor: any
) => {
  const decorationSet = DecorationSet.create(
    state.doc,
    comments.map((comment) => {
      if (comment.id === highlightedComment?.id) {
        editor.storage.comments.highlightedCommentFromPos =
          comment.absoluteFrom;
      }
      return Decoration.inline(comment.absoluteFrom, comment.absoluteTo, {
        class: `editor-comment ${
          comment.id === highlightedComment?.id && "editor-comment-active"
        }`,
      });
    })
  );
  // @ts-expect-error adding them here so we can read them out from the editor state
  decorationSet.comments = comments;
  return decorationSet;
};

let prevHighlightedCommentId: null | string = null;

export const CommentsExtension = Extension.create<
  CommentsExtensionOptions,
  CommentsExtensionStorage
>({
  name: "comments",

  addOptions() {
    return {
      comments: [],
      yDoc: {} as Y.Doc,
      highlightComment: () => undefined,
      highlightedComment: null,
    };
  },

  addStorage() {
    return {
      comments: this.options.comments,
      yDoc: this.options.yDoc,
      highlightComment: this.options.highlightComment,
      highlightedComment: this.options.highlightedComment,
      highlightedCommentFromPos: null,
    };
  },

  addProseMirrorPlugins() {
    const storage = this.editor.storage;
    const thisEditor = this.editor;

    return [
      new Plugin({
        key: new PluginKey("comments"),
        state: {
          init(editor, state) {
            const resolvedComments = resolveCommentPositions(
              storage.comments.comments,
              state,
              storage.comments.yDoc
            );
            return createCommentsDecorationSet(
              resolvedComments,
              storage.comments.highlightedComment,
              state,
              thisEditor
            );
          },
          apply(tr, oldState, newState) {
            const resolvedComments = resolveCommentPositions(
              storage.comments.comments,
              newState,
              storage.comments.yDoc
            );
            const commentToHighlight = resolvedComments.find((comment) => {
              return (
                comment.absoluteFrom <= newState.selection.from &&
                comment.absoluteTo >= newState.selection.to
              );
            });
            if (commentToHighlight) {
              if (prevHighlightedCommentId !== commentToHighlight.id) {
                prevHighlightedCommentId = commentToHighlight.id;
                storage.comments.highlightComment(commentToHighlight.id, false);
              }
            } else {
              if (prevHighlightedCommentId !== null) {
                // make sure an endless loop isn't triggered
                prevHighlightedCommentId = null;
                storage.comments.highlightComment(null, false);
              }
            }

            return createCommentsDecorationSet(
              resolvedComments,
              storage.comments.highlightedComment,
              newState,
              thisEditor
            );
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});
