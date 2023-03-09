import { Editor, Extension } from "@tiptap/core";
import { EditorState, Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import {
  relativePositionToAbsolutePosition,
  ySyncPluginKey,
} from "y-prosemirror";
import * as Y from "yjs";
import { EditorComment } from "../../types";
import { scrollToPos } from "../../utils/scrollToPos";

type HighlightedCommentSource = "editor" | "sidebar";

type HighlightedComment = { id: string; source: HighlightedCommentSource };

export interface CommentsExtensionOptions {
  comments: EditorComment[];
  yDoc: Y.Doc;
  highlightComment: (commentId: string | null) => void;
  highlightedComment: HighlightedComment | null;
}

type CommentsExtensionStorage = {
  comments: EditorComment[];
  yDoc: Y.Doc;
  highlightComment: (commentId: string | null) => void;
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
  return DecorationSet.create(
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
};

let prevHighlightedCommentId: null | string = null;

export const updateCommentsDataAndScrollToHighlighted = (
  editor: Editor,
  comments: EditorComment[],
  highlightedComment: HighlightedComment | null
) => {
  const shouldScrollToHighlightedComment =
    highlightedComment?.id &&
    editor.storage?.comments &&
    highlightedComment.id !== editor.storage.comments.highlightedComment?.id &&
    highlightedComment.source === "sidebar";

  editor.storage.comments.comments = comments;
  editor.storage.comments.highlightedComment = highlightedComment;

  // empty transaction to make sure the comments are updated
  editor.view.dispatch(editor.view.state.tr);
  if (
    shouldScrollToHighlightedComment &&
    editor.storage.comments.highlightedCommentFromPos !== null
  ) {
    scrollToPos(editor.view, editor.storage.comments.highlightedCommentFromPos);
  }
};

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
                storage.comments.highlightComment(commentToHighlight.id);
              }
            } else {
              if (prevHighlightedCommentId !== null) {
                // make sure an endless loop isn't triggered
                prevHighlightedCommentId = null;
                storage.comments.highlightComment(null);
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
