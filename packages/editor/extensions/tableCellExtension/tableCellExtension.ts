import TableCell from "@tiptap/extension-table-cell";

export const tableCellContent =
  "paragraph+ | heading+ | codeBlock+ | blockquote+ | orderedList+ | bulletList+ | taskList+ | file+";

export const TableCellExtension = TableCell.extend({
  content: tableCellContent,
});
