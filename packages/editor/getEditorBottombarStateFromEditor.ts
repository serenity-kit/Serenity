import { Editor } from "@tiptap/core";
import { EditorBottombarState } from "./types";

export const getEditorBottombarStateFromEditor = (
  editor: Editor
): EditorBottombarState => {
  return {
    isBold: editor.isActive("bold"),
    isItalic: editor.isActive("italic"),
  };
};
