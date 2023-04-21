import { Icon, TableInsert, View } from "@serenity-tools/ui";
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import {
  CellSelection,
  TableMap,
  addColumn,
  addRow,
  findCell,
} from "prosemirror-tables";
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
      <div className="insert-row">
        <TableInsert
          onPress={() => {
            const editor = props.editor.storage.tableCell.currentEditor;
            const { tr, tableRect, cellPositionInfo } = getTableInsertInfo();
            editor.view.dispatch(addRow(tr, tableRect, cellPositionInfo.top));
          }}
        />
      </div>

      <div className="insert-column">
        <TableInsert
          onPress={() => {
            const editor = props.editor.storage.tableCell.currentEditor;
            const { tr, tableRect, cellPositionInfo } = getTableInsertInfo();
            editor.view.dispatch(
              addColumn(tr, tableRect, cellPositionInfo.left)
            );
          }}
        />
      </div>

      <div
        className="mark-row"
        onClick={() => {
          const editor = props.editor.storage.tableCell.currentEditor;

          editor.storage.table.setTableActive(true);

          const state = editor.view.state;
          const resolvedPos = state.doc.resolve(props.getPos());
          const rowSelection = CellSelection.rowSelection(resolvedPos);
          editor.view.dispatch(state.tr.setSelection(rowSelection));
        }}
      >
        <Icon name="arrow-right-filled" />
      </div>
      <div
        className="mark-column"
        onClick={() => {
          return null;
        }}
      >
        <Icon name="arrow-down-filled" />
      </div>

      <NodeViewContent className="content" />
    </NodeViewWrapper>
  );
};
