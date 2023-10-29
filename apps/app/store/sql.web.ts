import initSqlJs, { Database } from "sql.js/dist/sql-asm";

let db: Database;

export const ready = async () => {
  const SQL = await initSqlJs({});
  db = new SQL.Database();
};

export const execute = (statement: string, params?: (string | number)[]) => {
  const resultArray = db.exec(statement, params);
  const result = resultArray[0];
  if (result === undefined) {
    return [];
  }

  const rows = result.values.map((row) => {
    const item = {};
    row.forEach((value, columnIndex) => {
      item[result.columns[columnIndex]] = value;
    });
    return item;
  });
  return rows;
};
