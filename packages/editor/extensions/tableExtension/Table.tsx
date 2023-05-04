import { Icon } from "@serenity-tools/ui";
import { TableMap, addColumn, addRow } from "@tiptap/pm/tables";
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import React from "react";

export const Table = (props: any) => {
  const [active, setActive] = React.useState(false);

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

    // console.log("table: resPos ", resolvedPos);
    // console.log("table: cellInfo ", cellPositionInfo);
    // console.log("table: table ", table);
    // console.log("table: tableStart ", tableStart);
    // console.log("table: rows ", rowCount);
    // console.log("table: columns ", colCount);
    // console.log("map: ", map);

    const tableRect = { ...cellPositionInfo, table, tableStart, map };
    return { tr: state.tr, tableRect, cellPositionInfo };
  };

  return (
    <NodeViewWrapper>
      <NodeViewContent
        className={props.extension.options.HTMLAttributes.class}
        as="table"
      />
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
          const tableStart = resolvedPos.start(1);

          const anchor = state.doc.resolve(tableStart);

          console.log("resPos: ", resolvedPos);
          console.log("pos: ", props.getPos());
          console.log("tablestart: ", tableStart);
          console.log("anchor ?: ", anchor);

          // we need a selection of the whole table, the rect must select the whole table
          // maybe we can add our own CellSelection or logic for tableSelection
          // editor.view.dispatch(state.tr.setSelection(tableSelection));
        }}
      ></div>
    </NodeViewWrapper>
  );
};
