import { Icon } from "@serenity-tools/ui";
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import React from "react";

export const TableCell = (props: any) => {
  // console.log(props.node);

  return (
    <NodeViewWrapper>
      <div className="insert-row">
        <Icon name="add-line" />
      </div>
      <div className="insert-column">
        <Icon name="add-line" />
      </div>

      <NodeViewContent className="content" />
    </NodeViewWrapper>
  );
};
