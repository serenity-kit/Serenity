import TableCell from "@tiptap/extension-table-cell";

export const TableCellExtension = TableCell.extend({
  content:
    "paragraph+ | heading+ | codeBlock+ | blockquote+ | orderedList+ | bulletList+ | taskList+ | file+",
});
