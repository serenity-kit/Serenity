import { Editor } from "@tiptap/core";
import { UpdateEditorParams } from "./types";

export const updateEditor = (editor: Editor, params: UpdateEditorParams) => {
  if (params.variant === "toggle-bold") {
    editor.chain().focus().toggleBold().run();
  } else if (params.variant === "toggle-italic") {
    editor.chain().focus().toggleItalic().run();
  }
};
