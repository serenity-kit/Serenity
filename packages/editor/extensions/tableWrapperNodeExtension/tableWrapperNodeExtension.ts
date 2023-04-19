import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { TableWrapper } from "./TableWrapper";

export const TableWrapperNodeExtension = Node.create({
  name: "table-wrapper",
  group: "block",
  content: "table",

  parseHTML() {
    return [{ tag: "div" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TableWrapper);
  },
});
