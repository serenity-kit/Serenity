import TiptapTableExtension from "@tiptap/extension-table";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { Table } from "./Table";

export const TableExtension = TiptapTableExtension.extend({
  addStorage() {
    return {
      setTableActive: null,
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(Table);
  },
});
