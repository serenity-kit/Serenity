import { Editor } from "@tiptap/core";
import { EditorBottombarState } from "./types";

export const getEditorBottombarStateFromEditor = (
  editor: Editor
): EditorBottombarState => {
  return {
    isBold: editor.isActive("bold"),
    isItalic: editor.isActive("italic"),
    isCode: editor.isActive("code"),
    isHeading1: editor.isActive("heading", { level: 1 }),
    isHeading2: editor.isActive("heading", { level: 2 }),
    isHeading3: editor.isActive("heading", { level: 3 }),
  };
};
