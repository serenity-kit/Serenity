import { Editor } from "@tiptap/core";
import { UpdateEditorParams } from "./types";

export const updateEditor = (editor: Editor, params: UpdateEditorParams) => {
  if (params.variant === "toggle-bold") {
    editor.chain().focus().toggleBold().run();
  } else if (params.variant === "toggle-italic") {
    editor.chain().focus().toggleItalic().run();
  } else if (params.variant === "toggle-code") {
    editor.chain().focus().toggleCode().run();
  } else if (params.variant === "toggle-heading-1") {
    editor.chain().focus().toggleHeading({ level: 1 }).run();
  } else if (params.variant === "toggle-heading-2") {
    editor.chain().focus().toggleHeading({ level: 2 }).run();
  } else if (params.variant === "toggle-heading-3") {
    editor.chain().focus().toggleHeading({ level: 3 }).run();
  }
};
