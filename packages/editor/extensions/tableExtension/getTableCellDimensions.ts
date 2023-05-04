export type TableCellDimensions = {
  columnWidths: number[];
  rowHeights: number[];
};

export const getTableCellDimensions = (table: HTMLTableElement) => {
  const rows = Array.from(table.rows);
  const rowHeights = rows.map((row) => row.offsetHeight);
  const columnWidths = rows.reduce((widths: number[], row, rowIndex) => {
    const cells = Array.from(row.cells);
    if (rowIndex === 0) {
      return cells.map((cell) => cell.offsetWidth);
    }
    return widths;
  }, []);

  return {
    columnWidths,
    rowHeights,
  };
};
