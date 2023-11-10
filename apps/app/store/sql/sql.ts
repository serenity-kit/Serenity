import { OPSQLiteConnection, open } from "@op-engineering/op-sqlite";
// import { QuickSQLiteConnection, open } from "react-native-quick-sqlite";

let db: OPSQLiteConnection;
// let db: QuickSQLiteConnection;

export const ready = () => {
  if (db) {
    return Promise.resolve();
  }
  // db = open({ name: ":memory:", inMemory: true });
  db = open({ name: ":memory:" });
  return Promise.resolve();
};

export const resetInMemoryDatabase = () => {
  db.close();
  // db = open({ name: ":memory:", inMemory: true });
  db = open({ name: ":memory:" });
};

export const triggerDebouncedDatabasePersisting = () => {};

export const destroyPersistedDatabase = async () => {
  return Promise.resolve();
};

export const execute = (
  statement: string,
  params?: (string | number | Uint8Array | null)[]
) => {
  try {
    const { rows } = db.execute(statement, params);
    return rows?._array || [];
  } catch (e) {
    console.error(e);
    throw e;
  }
};
