import { Editor, Extension } from "@tiptap/core";

export interface ExtensionOptions {}

type Storage = {};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    serenityScrollIntoViewForEditModeExtension: {
      scrollIntoViewOnEditMode: () => ReturnType;
      scrollIntoViewWhileEditMode: () => ReturnType;
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

const scrollIntoView = (editor: Editor) => {
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
  return false;
};

export const SerenityScrollIntoViewForEditModeExtension = Extension.create<
  ExtensionOptions,
  Storage
>({
  name: "serenityScrollIntoViewForEditModeExtension",

  addCommands() {
    return {
      scrollIntoViewOnEditMode:
        () =>
        ({ commands, editor }) => {
          return scrollIntoView(editor);
        },
      scrollIntoViewWhileEditMode:
        () =>
        ({ commands, editor }) => {
          if (editor.isFocused) {
            return scrollIntoView(editor);
          }
          return false;
        },
    };
  },
});
