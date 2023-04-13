import { Icon } from "@serenity-tools/ui";
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import { findCell } from "prosemirror-tables";
import React from "react";

export const TableCell = (props: any) => {
  console.log(props);

  const resolvedPos = props.editor.view.state.doc.resolve(props.getPos());
  const cellPositionInfo = findCell(resolvedPos);

  return (
    <NodeViewWrapper>
      {/* only show when in first column */}
      {cellPositionInfo?.left === 0 ? (
        <div
          className="insert-row"
          onClick={() => {
            console.log(cellPositionInfo);
          }}
        >
          <Icon name="add-line" />
        </div>
      ) : null}

      {/* only show when in first row */}
      {cellPositionInfo?.top === 0 ? (
        <div className="insert-column">
          <Icon name="add-line" />
        </div>
      ) : null}

      <NodeViewContent className="content" />
    </NodeViewWrapper>
  );
};
