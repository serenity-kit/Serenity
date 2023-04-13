import { Icon } from "@serenity-tools/ui";
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import { TableMap, addRow, findCell } from "prosemirror-tables";
import React from "react";

export const TableCell = (props: any) => {
  // console.log(props);

  return (
    <NodeViewWrapper>
      <div
        className="insert-row"
        onClick={() => {
          const editor = props.editor.storage.tableCell.currentEditor;
          const state = editor.view.state;
          const resolvedPos = state.doc.resolve(props.getPos());
          const cellPositionInfo = findCell(resolvedPos);
          const table = resolvedPos.node(-1);
          const tableStart = resolvedPos.start(-1);
          const map = TableMap.get(table);
          const tableRect = { ...cellPositionInfo, table, tableStart, map };
          editor.view.dispatch(
            addRow(state.tr, tableRect, cellPositionInfo.top)
          );
        }}
      >
        <Icon name="add-line" />
      </div>

      <div className="insert-column">
        <Icon name="add-line" />
      </div>

      <NodeViewContent className="content" />
    </NodeViewWrapper>
  );
};
