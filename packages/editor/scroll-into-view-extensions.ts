import { Extension } from "@tiptap/core";

export interface ExtensionOptions {}

type Storage = {};

export const SerenityScrollIntoViewExtension = Extension.create<
  ExtensionOptions,
  Storage
>({
  name: "serenityScrollIntoViewExtension",

  addCommands() {
    return {
      scrollIntoView:
        () =>
        ({ commands, editor }) => {
          const { from, to } = editor.state.selection;

          const end = editor.view.coordsAtPos(to);

          const editorBoundaries = editor.view.dom.getBoundingClientRect();
          console.log("end", end);

          // only scroll if it's below the keynboard + toolbar
          if (end.top > editorBoundaries.height - 352 - 50) {
            const scrollTop =
              editor.view.dom.parentElement?.parentElement?.scrollTop || 0;

            editor.view.dom.parentElement?.parentElement?.scrollTo({
              // covers the editor toolbar plus some space to not end up at the very bottom
              top: end.top + scrollTop - 300,
              behavior: "smooth", // jfyi not supported on iOS Safari
            });
            return true;
          }
        },
    };
  },
});
