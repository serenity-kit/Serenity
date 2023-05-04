import { Icon } from "@serenity-tools/ui";
import { CellSelection, TableMap, addColumn, addRow } from "@tiptap/pm/tables";
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import React, { useRef } from "react";
import useResizeObserver from "use-resize-observer";
import {
  TableCellDimensions,
  getTableCellDimensions,
} from "./getTableCellDimensions";

export const Table = (props: any) => {
  const [active, setActive] = React.useState(false);
  const [tableCellDimension, setTableCellDimension] =
    React.useState<TableCellDimensions>({ columnWidths: [], rowHeights: [] });

  props.editor.storage.table.setTableActive = setActive;

  const getTableInsertInfo = () => {
    const editor = props.editor.storage.tableCell.currentEditor;
    const state = editor.view.state;
    const resolvedPos = state.doc.resolve(props.getPos());

    const table = props.node;
    const tableStart = resolvedPos.start(1);
    const map = TableMap.get(table);

    const rowCount = map.height;
    const colCount = map.width;

    // info of last cell in table
    const cellPositionInfo = {
      left: colCount - 1,
      top: rowCount - 1,
      right: colCount,
      bottom: rowCount,
    };

    const tableRect = { ...cellPositionInfo, table, tableStart, map };
    return { tr: state.tr, tableRect, cellPositionInfo };
  };

  const tableWrapperRef = useRef<HTMLDivElement>(null);
  useResizeObserver({
    onResize: (params) => {
      if (!tableWrapperRef.current) return;
      const dimensions = getTableCellDimensions(
        tableWrapperRef.current.children[0] as HTMLTableElement
      );
      setTableCellDimension(dimensions);
    },
    ref: tableWrapperRef,
  });

  return (
    <NodeViewWrapper>
      <div ref={tableWrapperRef}>
        <NodeViewContent
          className={props.extension.options.HTMLAttributes.class}
          as="table"
        />
      </div>
      {/* <div
        onClick={() => {
          return null;
        }}
      >
        <Icon name="arrow-down-filled" /> {active ? "Active" : "Not Active"}
      </div> */}
      <div
        className="add add-column"
        onClick={() => {
          const editor = props.editor.storage.tableCell.currentEditor;
          const { tr, tableRect, cellPositionInfo } = getTableInsertInfo();
          editor.view.dispatch(
            addColumn(tr, tableRect, cellPositionInfo.right)
          );
        }}
      >
        <Icon name="add-line" color="gray-600" />
      </div>
      <div
        className="add add-row"
        onClick={() => {
          const editor = props.editor.storage.tableCell.currentEditor;
          const { tr, tableRect, cellPositionInfo } = getTableInsertInfo();
          editor.view.dispatch(addRow(tr, tableRect, cellPositionInfo.bottom));
        }}
      >
        <Icon name="add-line" color="gray-600" />
      </div>
      <div className="row-line hidden"></div>
      <div className="column-line hidden"></div>
      <div className="table-selection hidden"></div>
      <div
        className="mark-table"
        onClick={() => {
          const editor = props.editor.storage.tableCell.currentEditor;
          const state = editor.view.state;

          const resolvedPos = state.doc.resolve(props.getPos());
          const table = props.node;
          const tableStart = resolvedPos.start(1);
          const tableMap = TableMap.get(table);
          const anchorPos = tableMap.map[0];
          const headPos = tableMap.map[tableMap.map.length - 1];

          const selection = new CellSelection(
            state.doc.resolve(tableStart + anchorPos),
            state.doc.resolve(tableStart + headPos)
          );
          editor.view.dispatch(state.tr.setSelection(selection));
        }}
      ></div>
      {tableCellDimension.columnWidths.map((width, index) => {
        return (
          <div
            style={{ width }}
            onClick={() => {
              const editor = props.editor.storage.tableCell.currentEditor;
              const state = editor.view.state;

              const resolvedPos = state.doc.resolve(props.getPos());
              const table = props.node;
              const tableStart = resolvedPos.start(1);
              const tableMap = TableMap.get(table);

              const cellPos = tableMap.positionAt(0, index, table);
              const resolvedCellPos = state.doc.resolve(tableStart + cellPos);

              const rowSelection = CellSelection.colSelection(resolvedCellPos);
              editor.view.dispatch(state.tr.setSelection(rowSelection));
            }}
          >
            column selector: {index}
          </div>
        );
      })}
    </NodeViewWrapper>
  );
};
