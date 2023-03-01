import TableHeader from "@tiptap/extension-table-header";
import { tableCellContent } from "../tableCellExtension/tableCellExtension";

export const TableHeaderExtension = TableHeader.extend({
  content: tableCellContent,
});
