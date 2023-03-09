import {
  FileNodeAttributes,
  updateFileAttributes,
} from "@serenity-tools/editor-file-extension";
import { Editor } from "@tiptap/core";
import { UpdateEditorParams } from "./types";

export const updateEditor = (editor: Editor, params: UpdateEditorParams) => {
  if (params.variant === "toggle-bold") {
    editor.chain().focus().toggleBold().run();
  } else if (params.variant === "toggle-italic") {
    editor.chain().focus().toggleItalic().run();
  } else if (params.variant === "toggle-code") {
    editor.chain().focus().toggleCode().run();
  } else if (params.variant === "toggle-link") {
    // styling dummy
    editor.chain().focus().toggleLink({ href: "#" }).run();
  } else if (params.variant === "toggle-heading-1") {
    editor.chain().focus().toggleHeading({ level: 1 }).run();
  } else if (params.variant === "toggle-heading-2") {
    editor.chain().focus().toggleHeading({ level: 2 }).run();
  } else if (params.variant === "toggle-heading-3") {
    editor.chain().focus().toggleHeading({ level: 3 }).run();
  } else if (params.variant === "toggle-code-block") {
    editor.chain().focus().toggleCodeBlock().run();
  } else if (params.variant === "toggle-blockquote") {
    editor.chain().focus().toggleBlockquote().run();
  } else if (params.variant === "toggle-bullet-list") {
    editor.chain().focus().toggleBulletList().run();
  } else if (params.variant === "toggle-ordered-list") {
    editor.chain().focus().toggleOrderedList().run();
  } else if (params.variant === "toggle-task-list") {
    editor.chain().focus().toggleTaskList().run();
  } else if (params.variant === "insert-image") {
    const { width, height, mimeType, uploadId } = params.params;
    const attrs: FileNodeAttributes = {
      subtype: "image",
      subtypeAttributes: {
        width,
        height,
      },
      mimeType,
      uploadId,
    };
    editor.commands.insertContent(
      { type: "file", attrs },
      { updateSelection: false }
    );
  } else if (params.variant === "update-image-attributes") {
    updateFileAttributes({ ...params.params, view: editor.view });
  } else if (params.variant === "undo") {
    editor.chain().undo().focus().run();
  } else if (params.variant === "redo") {
    editor.chain().redo().focus().run();
  } else if (params.variant === "update-comments") {
    editor.storage.comments.comments = params.params.decryptedComments;
    editor.storage.comments.highlightedComment =
      params.params.highlightedComment;
    // empty transaction to make sure the comments are updated
    editor.view.dispatch(editor.view.state.tr);
  }
};
