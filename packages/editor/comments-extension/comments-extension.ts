import { Extension } from "@tiptap/core";
import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { EditorComment } from "../types";

export interface CommentsExtensionOptions {
  comments: EditorComment[];
}

type CommentsExtensionStorage = {
  comments: EditorComment[];
};

export const CommentsExtension = Extension.create<
  CommentsExtensionOptions,
  CommentsExtensionStorage
>({
  name: "comments",

  addOptions() {
    return {
      comments: [],
    };
  },

  addStorage() {
    return {
      comments: this.options.comments,
    };
  },

  addProseMirrorPlugins() {
    const storage = this.editor.storage;

    return [
      new Plugin({
        state: {
          init(editor, { doc }) {
            return DecorationSet.create(
              doc,
              storage.comments.comments.map((comment: EditorComment) => {
                return Decoration.inline(comment.from, comment.to, {
                  style: "background-color: yellow",
                });
              })
            );
          },
          apply(tr, old) {
            return DecorationSet.create(
              tr.doc,
              storage.comments.comments.map((comment: EditorComment) => {
                return Decoration.inline(comment.from, comment.to, {
                  style: "background-color: yellow",
                });
              })
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
