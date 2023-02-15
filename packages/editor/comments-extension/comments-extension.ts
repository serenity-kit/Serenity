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
}

type CommentsExtensionStorage = {
  comments: EditorComment[];
  yDoc: Y.Doc;
};

// inspired by https://stackoverflow.com/a/46700791
export function notNull<TypeValue>(
  value: TypeValue | null
): value is TypeValue {
  return value !== null;
}

const createDecorationSet = (
  comments: EditorComment[],
  state: EditorState,
  yDoc: Y.Doc
) => {
  const ystate = ySyncPluginKey.getState(state);
  const { type, binding } = ystate;
  if (!binding) return DecorationSet.empty;

  const commentDecorations = comments
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
      return Decoration.inline(from, to, {
        style: "background-color: yellow",
      });
    })
    .filter(notNull);

  return DecorationSet.create(state.doc, commentDecorations);
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
    };
  },

  addStorage() {
    return {
      comments: this.options.comments,
      yDoc: this.options.yDoc,
    };
  },

  addProseMirrorPlugins() {
    const storage = this.editor.storage;

    return [
      new Plugin({
        state: {
          init(editor, state) {
            return createDecorationSet(
              storage.comments.comments,
              state,
              storage.comments.yDoc
            );
          },
          apply(tr, oldState, newState) {
            return createDecorationSet(
              storage.comments.comments,
              newState,
              storage.comments.yDoc
            );
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
