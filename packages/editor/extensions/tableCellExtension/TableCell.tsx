import { TableHandle, TableInsert } from "@serenity-tools/ui";
import { addRow } from "@tiptap/pm/tables";
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import {
  CellSelection,
  TableMap,
  addColumn,
  findCell,
} from "prosemirror-tables";
import React from "react";

export const TableCell = (props: any) => {
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
        className="insert-column"
        onMouseEnter={(event) => {
          let target = event.target;
          // @ts-expect-error
          let wrapper = target.closest(".table-wrapper");
          let column_line = wrapper.querySelector(".column-line");
          let offset =
            // @ts-expect-error
            target.getBoundingClientRect().left -
            wrapper.getBoundingClientRect().left;

          let targetWidth = event.currentTarget.offsetWidth;

          // offset of dot + half a dot-width (16/2) - 1px as it needs to overlap the border
          column_line.style.left = `${offset + (targetWidth / 2 - 1)}px`;
          column_line.classList.remove("hidden");
        }}
        onMouseLeave={(event) => {
          let target = event.target;
          // @ts-expect-error
          let wrapper = target.closest(".table-wrapper");
          let column_line = wrapper.querySelector(".column-line");
          column_line.classList.add("hidden");
        }}
      >
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
      <NodeViewContent className="content" />
    </NodeViewWrapper>
  );
};
