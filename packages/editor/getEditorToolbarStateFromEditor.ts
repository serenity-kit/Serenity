import { Editor } from "@tiptap/core";
import { EditorToolbarState } from "./types";

export const getEditorToolbarStateFromEditor = (
  editor: Editor
): EditorToolbarState => {
  return {
    isBold: editor.isActive("bold"),
    isItalic: editor.isActive("italic"),
  };
};
