import TiptapTableCellExtension from "@tiptap/extension-table-cell";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { TableCell } from "./TableCell";

// the default also allows to nest tables which we don't want
export const tableCellContent =
  "paragraph+ | heading+ | codeBlock+ | blockquote+ | orderedList+ | bulletList+ | taskList+ | file+";

export const TableCellExtension = TiptapTableCellExtension.extend({
  content: tableCellContent,

  addStorage() {
    return {
      // the ReactNodeViewRenderer doesn't re-render except it's content, attributes or selection changes
      // and therefor we can have an outdated editor reference in the React component which can result
      // in errors when we try to dispatch an action within the editor e.g. adding a row above an existing row
      currentEditor: null,
    };
  },

  onUpdate() {
    this.storage.currentEditor = this.editor;
  },

  addNodeView() {
    return ReactNodeViewRenderer(TableCell, {
      as: "td",
    });
  },
});
