import * as sql from "./sql/sql";

export const table = "current_user_store_v2";

type UserInfo = {
  userId: string;
  mainDeviceSigningPublicKey: string;
};

export const initialize = () => {
  sql.execute(
    `CREATE TABLE IF NOT EXISTS "${table}" (
      "id"	TEXT NOT NULL,
      "userId"	TEXT NOT NULL,
      "mainDeviceSigningPublicKey"	TEXT NOT NULL,
      PRIMARY KEY("id")
    );`
  );
};

export const wipeCaches = () => {};

export const setCurrentUserInfo = ({
  userId,
  mainDeviceSigningPublicKey,
}: UserInfo) => {
  sql.execute(
    `INSERT INTO "${table}" (id, userId, mainDeviceSigningPublicKey)
      VALUES (?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
      userId = excluded.userId,
      mainDeviceSigningPublicKey = excluded.mainDeviceSigningPublicKey`,
    ["currentUser", userId, mainDeviceSigningPublicKey]
  );
};

export const getCurrentUserInfo = () => {
  const currentUser = sql.execute(
    `SELECT * FROM ${table} WHERE id = "currentUser"`
  );
  if (currentUser.length === 0) {
    return undefined;
  }
  return {
    userId: currentUser[0].userId,
    mainDeviceSigningPublicKey: currentUser[0].mainDeviceSigningPublicKey,
  } as UserInfo;
};
