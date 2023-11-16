import { OPSQLiteConnection, open } from "@op-engineering/op-sqlcipher";

let db: OPSQLiteConnection;

export const ready = () => {
  if (db) {
    return Promise.resolve();
  }
  db = open({
    name: "serenity-db",
    encryptionKey: "SDASDWQEWQWQEQWESXVEFWEADASDFSAD",
    inMemory: true,
  });
  return Promise.resolve();
};

export const resetInMemoryDatabase = () => {};

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
