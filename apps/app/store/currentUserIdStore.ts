import * as sql from "./sql/sql";

export const table = "current_user_store_v1";

export const initialize = () => {
  sql.execute(
    `CREATE TABLE IF NOT EXISTS "${table}" (
      "id"	TEXT NOT NULL,
      "userId"	TEXT NOT NULL,
      PRIMARY KEY("id")
    );`
  );
};

export const setCurrentUserId = (userId: string) => {
  sql.execute(
    `INSERT INTO "${table}" (id, userId)
      VALUES (?, ?)
      ON CONFLICT(id) DO UPDATE SET
      userId = excluded.userId`,
    ["currentUser", userId]
  );
};

export const getCurrentUserId = (userId: string) => {
  const currentUser = sql.execute(
    `SELECT * FROM ${table} WHERE id = "currentUser"`
  );
  if (currentUser.length === 0) {
    return undefined;
  }
  return currentUser[0].userId;
};
