import { OPSQLiteConnection, open } from "@op-engineering/op-sqlcipher";
import * as SecureStore from "expo-secure-store";
import sodium from "libsodium-wrappers";

export const serenityDbKeyId = "serenity-db.key";

let db: OPSQLiteConnection;

export const ready = async () => {
  if (db) {
    return undefined;
  }

  await sodium.ready;
  let key = await SecureStore.getItemAsync(serenityDbKeyId);
  if (!key) {
    key = sodium.to_base64(
      sodium.randombytes_buf(sodium.crypto_secretbox_KEYBYTES)
    );
    await SecureStore.setItemAsync(serenityDbKeyId, key);
  }

  db = open({
    name: "serenity-db",
    encryptionKey: key,
    inMemory: true,
  });
  return Promise.resolve();
};

export const resetInMemoryDatabase = () => {};

export const triggerDebouncedDatabasePersisting = () => {};

export const destroyPersistedDatabase = async () => {
  db.delete();
  await SecureStore.deleteItemAsync(serenityDbKeyId);
  // creates a new empty DB that is encrypted with a new key
  await ready();
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
