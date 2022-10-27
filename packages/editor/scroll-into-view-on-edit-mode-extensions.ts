import { Extension } from "@tiptap/core";

export interface ExtensionOptions {}

type Storage = {};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    customExtension: {
      scrollIntoViewOnEditMode: () => ReturnType;
    };
  }
}

const isIos = [
  "iPad Simulator",
  "iPhone Simulator",
  "iPod Simulator",
  "iPad",
  "iPhone",
  "iPod",
].includes(navigator.platform);

export const SerenityScrollIntoViewOnEditModeExtension = Extension.create<
  ExtensionOptions,
  Storage
>({
  name: "serenityScrollIntoViewOnEditModeExtension",

  addCommands() {
    return {
      scrollIntoViewOnEditMode:
        () =>
        ({ commands, editor }) => {
          const { from, to } = editor.state.selection;
          const end = editor.view.coordsAtPos(to);
          const editorBoundaries = editor.view.dom.getBoundingClientRect();

          if (
            isIos
              ? // only scroll if it would be below the keyboard + toolbar
                end.top > editorBoundaries.height - 352 - 50
              : // only scroll if it would be below the toolbar
                end.top > editorBoundaries.height - 50
          ) {
            const scrollTop =
              editor.view.dom.parentElement?.parentElement?.scrollTop || 0;

            editor.view.dom.parentElement?.parentElement?.scrollTo({
              // covers the editor toolbar plus some space to not end up at the very bottom
              top: end.top + scrollTop - 300,
              behavior: "smooth", // jfyi not supported on iOS Safari
            });
            return true;
          }
          return true;
        },
    };
  },
});
