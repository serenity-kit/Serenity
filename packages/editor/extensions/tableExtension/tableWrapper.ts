import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { TableWrapperView } from "./TableWrapperView";

export const TableWrapper = Node.create({
  name: "table-wrapper",
  group: "block",
  content: "table",

  parseHTML() {
    return [{ tag: "table-wrapper" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["table-wrapper", mergeAttributes(HTMLAttributes), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TableWrapperView);
  },
});
