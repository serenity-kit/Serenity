import TableCell from "@tiptap/extension-table-cell";

// the default also allows to nest tables which we don't want
export const tableCellContent =
  "paragraph+ | heading+ | codeBlock+ | blockquote+ | orderedList+ | bulletList+ | taskList+ | file+";

export const TableCellExtension = TableCell.extend({
  content: tableCellContent,
});
