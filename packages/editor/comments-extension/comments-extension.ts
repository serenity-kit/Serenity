import { Extension } from "@tiptap/core";
import { EditorState, Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import {
  relativePositionToAbsolutePosition,
  ySyncPluginKey,
} from "y-prosemirror";
import * as Y from "yjs";
import { EditorComment } from "../types";

export interface CommentsExtensionOptions {
  comments: EditorComment[];
  yDoc: Y.Doc;
  highlightComment: (commentId: string | null) => void;
}

type CommentsExtensionStorage = {
  comments: EditorComment[];
  yDoc: Y.Doc;
  highlightComment: (commentId: string | null) => void;
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
  state: EditorState
) => {
  return DecorationSet.create(
    state.doc,
    comments.map((comment) => {
      return Decoration.inline(comment.absoluteFrom, comment.absoluteTo, {
        style: "background-color: yellow",
      });
    })
  );
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
    };
  },

  addStorage() {
    return {
      comments: this.options.comments,
      yDoc: this.options.yDoc,
      highlightComment: this.options.highlightComment,
    };
  },

  addProseMirrorPlugins() {
    const storage = this.editor.storage;

    return [
      new Plugin({
        state: {
          init(editor, state) {
            const resolvedComments = resolveCommentPositions(
              storage.comments.comments,
              state,
              storage.comments.yDoc
            );
            return createCommentsDecorationSet(resolvedComments, state);
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
              if (prevHighlightedCommentId !== commentToHighlight.commentId) {
                prevHighlightedCommentId = commentToHighlight.commentId;
                storage.comments.highlightComment(commentToHighlight.commentId);
              }
            } else {
              if (prevHighlightedCommentId !== null) {
                // make sure an endless loop isn't triggered
                prevHighlightedCommentId = null;
                storage.comments.highlightComment(null);
              }
            }

            return createCommentsDecorationSet(resolvedComments, newState);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
          handleClick(view, _, event) {
            // commentDecorations.push(
            //   Decoration.inline(0, 10, {
            //     text: "hello-world",
            //     style: "background-color: red",
            //   })
            // );
            // console.log("click", commentDecorations);
            // if (/lint-icon/.test(event.target.className)) {
            //   let { from, to } = event.target.problem;
            //   view.dispatch(
            //     view.state.tr
            //       .setSelection(TextSelection.create(view.state.doc, from, to))
            //       .scrollIntoView()
            //   );
            //   return true;
            // }
          },
        },
      }),
    ];
  },
});
