import TiptapTableCellExtension from "@tiptap/extension-table-cell";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { TableCell } from "./TableCell";

// the default also allows to nest tables which we don't want
export const tableCellContent =
  "paragraph+ | heading+ | codeBlock+ | blockquote+ | orderedList+ | bulletList+ | taskList+ | file+";

export const TableCellExtension = TiptapTableCellExtension.extend({
  content: tableCellContent,

  addNodeView() {
    return ReactNodeViewRenderer(TableCell, {
      as: "td",
    });
  },
});
