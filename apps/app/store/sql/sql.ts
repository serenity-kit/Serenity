import { QuickSQLiteConnection, open } from "react-native-quick-sqlite";

let db: QuickSQLiteConnection;

export const ready = () => {
  if (db) {
    return Promise.resolve();
  }
  db = open({ name: ":memory:" });
  return Promise.resolve();
};

export const resetInMemoryDatabase = () => {
  db.close();
  db = open({ name: ":memory:" });
};

export const execute = (statement: string, params?: (string | number)[]) => {
  const { rows } = db.execute(statement, params);
  return rows?._array || [];
};
