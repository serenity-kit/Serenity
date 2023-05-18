export type TableCellDimensions = {
  columnWidths: number[];
  rowHeights: number[];
};

export const getTableCellDimensions = (table: HTMLTableElement) => {
  const rows = Array.from(table.rows);
  const rowHeights = rows.map((row) => row.getBoundingClientRect().height);

  if (rows[0] === undefined) return { columnWidths: [], rowHeights: [] };

  // get cells from first row (as they will all have the same width in every row anyways)
  const cells = Array.from(rows[0].cells);
  const columnWidths = cells.map((cell) => cell.getBoundingClientRect().width);

  return {
    columnWidths,
    rowHeights,
  };
};
