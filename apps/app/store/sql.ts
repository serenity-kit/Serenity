import { QuickSQLiteConnection, open } from "react-native-quick-sqlite";

let db: QuickSQLiteConnection;

export const ready = () => {
  db = open({ name: ":memory:" });
  return Promise.resolve();
};

export const execute = (statement: string, params?: (string | number)[]) => {
  const { rows } = db.execute(statement, params);
  return rows?._array || [];
};
