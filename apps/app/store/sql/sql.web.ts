import type { Database, SqlJsStatic } from "sql.js";

let db: Database;
let SQL: SqlJsStatic;

export const ready = async () => {
  if (db) {
    return Promise.resolve();
  }
  const { default: initSqlJs } = await import("sql.js/dist/sql-wasm.js");
  SQL = await initSqlJs({
    locateFile: (file: string) => {
      // Wasm file is located at the root of the public folder (see apps/app/web)
      // more info https://docs.expo.dev/guides/customizing-metro/#expo-webpack-versus-expo-metro
      return `/${file}`;
    },
  });

  db = new SQL.Database();
};

export const resetInMemoryDatabase = () => {
  db.close();
  db = new SQL.Database();
};

export const triggerDebouncedDatabasePersisting = () => {
  // no-op
};

export const destroyPersistedDatabase = async () => {
  return Promise.resolve();
};

export const execute = (
  statement: string,
  params?: (string | number | null)[]
) => {
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

export const getInstances = () => {
  return { db, SQL };
};

export const setDatabase = (newDb: Database) => {
  db = newDb;
};
