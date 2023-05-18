import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import React from "react";

export const TableCell = (props: any) => {
  return (
    <NodeViewWrapper>
      <NodeViewContent className="content" />
    </NodeViewWrapper>
  );
};
