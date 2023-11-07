import { Database, SqlJsStatic } from "sql.js";

let db: Database;
let SQL: SqlJsStatic;

export const ready = async () => {
  if (db) {
    return Promise.resolve();
  }
  const { default: initSqlJs } = await import("sql.js/dist/sql-wasm.js");
  SQL = await initSqlJs({
    locateFile: (file: string) => {
      // TODO host this file ourselves
      // The issue here was Webpack 4 having issues with loading wasm files.
      // Should be easier to resolve after upgrading to Webpack 5 or Metro.
      return `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`;
    },
  });
  db = new SQL.Database();
};

export const resetInMemoryDatabase = () => {
  db.close();
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
