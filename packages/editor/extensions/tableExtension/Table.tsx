import { Icon } from "@serenity-tools/ui";
import { CellSelection, TableMap, addColumn, addRow } from "@tiptap/pm/tables";
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import React, { useEffect, useRef } from "react";
import useResizeObserver from "use-resize-observer";
import {
  TableCellDimensions,
  getTableCellDimensions,
} from "./getTableCellDimensions";
import { isCellSelection } from "./isCellSelection";

/*
 * get the cell-positions (relative to the parent-table) of every first cell of each row
 *
 * input:
 *   [1, 5, 9, 15, 19, 23],
 *    3
 *
 * output:
 *   [1, 15]
 */
function extractRowStartPoints(tableMap: number[], width: number): number[] {
  const rowCount = Math.ceil(tableMap.length / width);
  // rearrange array to look like rows with the cellstarts when given the width of the table
  // (as the width is equal to the length of each row => 2 rows with 3 cells => width: 3)
  // [1, 5, 9, 15, 19, 23] => [[1, 5, 9], [15, 19, 23]]
  const rows = Array.from({ length: rowCount }, (_, i) =>
    tableMap.slice(i * width, (i + 1) * width)
  );
  // only return positions of first cell of each row => [1, 15]
  return rows.map((row) => row[0]);
}

/*
 * get the cell-positions (relative to the parent-table) of every first cell of each column
 *
 * input:
 *   [1, 5, 9, 15, 19, 23],
 *    3
 *
 * output:
 *   [1, 5, 9]
 */
function extractColumnStartPoints(tableMap: number[], width: number) {
  const columnStartPoints: number[] = [];
  for (let i = 0; i < width; i++) {
    columnStartPoints.push(tableMap[i]);
  }
  return columnStartPoints;
}

export const Table = (props: any) => {
  const [active, setActive] = React.useState(false);
  const [rowSelected, setRowSelected] = React.useState<null | number>(null);
  const [columnSelected, setColumnSelected] = React.useState<null | number>(
    null
  );
  const [tableCellDimension, setTableCellDimension] =
    React.useState<TableCellDimensions>({ columnWidths: [], rowHeights: [] });

  props.editor.storage.table.setTableActive = setActive;

  console.log("ROW SELECTED", rowSelected);
  console.log("COLUMN SELECTED", columnSelected);

  const getColWidth = (index: number) => {
    if (!tableWrapperRef.current) return 0;
    const table = tableWrapperRef.current.children[0] as HTMLTableElement;

    const firstRow = table.rows[0];
    const activeCell = firstRow.cells[index];

    return activeCell.getBoundingClientRect().width;
  };

  const getTableInfo = () => {
    const editor = props.editor.storage.tableCell.currentEditor;
    const state = editor.view.state;
    const resolvedPos = state.doc.resolve(props.getPos());

    const table = props.node;
    const tableStart = resolvedPos.start(1);
    const tableMap = TableMap.get(table);

    return { table, tableMap, tableStart };
  };

  const getTableInsertInfo = () => {
    const editor = props.editor.storage.tableCell.currentEditor;
    const state = editor.view.state;

    // needs to be named map for TableRect
    const { table, tableMap: map, tableStart } = getTableInfo();

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

  // set to accumulate absolute position of marking elements
  let markRowTop = 0;
  let markColumnLeft = 0;

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

  useEffect(() => {
    // props.editor.on('selectionUpdate', ({ editor }) => {
    //   // The selection has changed.
    // })
    // const state = props.editor.view.state;
    // console.log(isRowSelected(state, 1));
    // console.log(props.editor);
    props.editor.on("selectionUpdate", (params: any) => {
      const updateRowSelection = () => {
        // get the current selection
        const selection = params.editor.view.state.selection;

        // check if it is a CellSelection, otherwise return
        if (!isCellSelection(selection)) {
          setRowSelected(null);
          return;
        }

        // check if it is a RowSelection, otherwise return
        const isRowSelection = selection.isRowSelection();
        if (!isRowSelection) {
          setRowSelected(null);
          return;
        }

        // get the anchorCell out of the selection (as we now know there definitely is one)
        const { $anchorCell } = selection;

        // as we are on cell-level here we need to get the tableInfo manually
        const tableNode = selection.$anchorCell.node(-1);
        const tableMap = TableMap.get(tableNode);
        const tableStart = $anchorCell.start(-1); // tableStart is one lvl higher than Cell => -1

        // e.g. 121
        console.log("row test start: ", tableStart);
        // map: [1, 5, 11, 15], height: 2, witdh: 2 (positions relative to table not in page context)
        console.log("row test map: ", tableMap);
        // [1, 11] - relative position of first cells of each row
        console.log(
          "row test restruct: ",
          extractRowStartPoints(tableMap.map, tableMap.width)
        );

        // get all startingPoints of each row inside the table but relative to the document
        const startingPoints = extractRowStartPoints(
          tableMap.map,
          tableMap.width
        ).map((value) => value + tableStart);

        // [122, 132] => because 1 and 11 where the first cells of each row
        console.log("row test points: ", startingPoints);
        // resolved pos of the anchorCell, e.g. {pos: 122, path: Array(9), parentOffset: 0, depth: 2}
        console.log("row test anchorCell: ", $anchorCell);

        // check if the position of the anchorCell matches one of the row-starting points
        const rowNumber = startingPoints.indexOf($anchorCell.pos);
        if (rowNumber === -1) {
          setRowSelected(null);
        } else {
          setRowSelected(rowNumber);
        }
      };
      updateRowSelection();

      const updateColumnSelection = () => {
        // get the current selection
        const selection = params.editor.view.state.selection;

        // check if it is a CellSelection, otherwise return
        if (!isCellSelection(selection)) {
          setColumnSelected(null);
          return;
        }

        // check if it is a ColSelection, otherwise return
        const isColSelection = selection.isColSelection();
        if (!isColSelection) {
          setColumnSelected(null);
          return;
        }

        // get the anchorCell out of the selection (as we now know there definitely is one)
        const { $anchorCell } = selection;

        // as we are on cell-level here we need to get the tableInfo manually
        const tableNode = selection.$anchorCell.node(-1);
        const tableMap = TableMap.get(tableNode);
        const tableStart = $anchorCell.start(-1);

        // e.g. 121
        console.log("col test start: ", tableStart);
        // map: [1, 5, 11, 15], height: 2, witdh: 2 (positions relative to table not in page context)
        console.log("col test map: ", tableMap);
        // [1, 5] - relative position of first cells of each column
        console.log(
          "col test extract: ",
          extractColumnStartPoints(tableMap.map, tableMap.width)
        );

        // get all startingPoints of each row inside the table but relative to the document
        const startingPoints = extractColumnStartPoints(
          tableMap.map,
          tableMap.width
        ).map((value) => value + tableStart);

        // [122, 126] => because 1 and 5 where the first cells of each col
        console.log("col test points: ", startingPoints);
        // resolved pos of the anchorCell, e.g. {pos: 126, path: Array(9), parentOffset: 4, depth: 2}
        console.log("col test anchorCell: ", $anchorCell);

        const columnNumber = startingPoints.indexOf($anchorCell.pos);
        if (columnNumber === -1) {
          setColumnSelected(null);
        } else {
          setColumnSelected(columnNumber);
        }
      };
      updateColumnSelection();
    });
  }, [props.editor]);

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

          const { tableMap, tableStart } = getTableInfo();

          const anchorPos = tableMap.map[0];
          const headPos = tableMap.map[tableMap.map.length - 1];

          const selection = new CellSelection(
            state.doc.resolve(tableStart + anchorPos),
            state.doc.resolve(tableStart + headPos)
          );
          editor.view.dispatch(state.tr.setSelection(selection));
        }}
      ></div>
      {tableCellDimension.rowHeights.map((height, index) => {
        markRowTop += index > 0 ? tableCellDimension.rowHeights[index - 1] : 0;

        return (
          <div
            className={`drag-row ${rowSelected === index && "active"}`}
            style={{
              top: markRowTop,
              height: index === 0 ? height : height - 1, // minus one border-width
            }}
            onClick={() => {
              const editor = props.editor.storage.tableCell.currentEditor;
              const state = editor.view.state;

              const { table, tableMap, tableStart } = getTableInfo();

              const cellPos = tableMap.positionAt(index, 0, table);
              const resolvedCellPos = state.doc.resolve(tableStart + cellPos);

              const rowSelection = CellSelection.rowSelection(resolvedCellPos);
              editor.view.dispatch(state.tr.setSelection(rowSelection));
            }}
          ></div>
        );
      })}
      {tableCellDimension.columnWidths.map((width, index) => {
        markColumnLeft += index > 0 ? getColWidth(index - 1) : 0;

        // this represents the actual unrounded width of the <td> DOM element (needed as added columns will be calculated via division)
        // using just the columnWidth of the tableCellDimensions isn't precise enough
        const colWidth = getColWidth(index);

        return (
          <div
            className={`drag-column ${columnSelected === index && "active"}`}
            style={{
              left: markColumnLeft,
              width: index === 0 ? colWidth : colWidth - 1, // minus one border-width
            }}
            onClick={() => {
              const editor = props.editor.storage.tableCell.currentEditor;
              const state = editor.view.state;

              const { table, tableMap, tableStart } = getTableInfo();

              const cellPos = tableMap.positionAt(0, index, table);
              const resolvedCellPos = state.doc.resolve(tableStart + cellPos);

              const colSelection = CellSelection.colSelection(resolvedCellPos);
              editor.view.dispatch(state.tr.setSelection(colSelection));
            }}
          ></div>
        );
      })}
    </NodeViewWrapper>
  );
};
