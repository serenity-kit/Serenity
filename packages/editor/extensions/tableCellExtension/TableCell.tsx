import { Icon } from "@serenity-tools/ui";
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import { TableMap, addColumn, addRow, findCell } from "prosemirror-tables";
import React from "react";

export const TableCell = (props: any) => {
  // console.log(props);

  const getTableInsertInfo = () => {
    const editor = props.editor.storage.tableCell.currentEditor;
    const state = editor.view.state;
    const resolvedPos = state.doc.resolve(props.getPos());
    const cellPositionInfo = findCell(resolvedPos);
    const table = resolvedPos.node(-1);
    const tableStart = resolvedPos.start(-1);
    const map = TableMap.get(table);
    const tableRect = { ...cellPositionInfo, table, tableStart, map };
    return { tr: state.tr, tableRect, cellPositionInfo };
  };

  return (
    <NodeViewWrapper>
      <div
        className="insert-row"
        onClick={() => {
          const editor = props.editor.storage.tableCell.currentEditor;
          const { tr, tableRect, cellPositionInfo } = getTableInsertInfo();
          editor.view.dispatch(addRow(tr, tableRect, cellPositionInfo.top));
        }}
      >
        <Icon name="add-line" />
      </div>

      <div
        className="insert-column"
        onClick={() => {
          const editor = props.editor.storage.tableCell.currentEditor;
          const { tr, tableRect, cellPositionInfo } = getTableInsertInfo();
          editor.view.dispatch(addColumn(tr, tableRect, cellPositionInfo.left));
        }}
      >
        <Icon name="add-line" />
      </div>

      <NodeViewContent className="content" />
    </NodeViewWrapper>
  );
};
