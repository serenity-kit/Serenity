import * as sql from "./sql/sql";
import * as userStore from "./userStore";

export const table = "user_chain_v1";

export const initialize = async () => {
  await sql.ready();

  sql.execute(
    `CREATE TABLE IF NOT EXISTS "${table}" (
      "position"	INTEGER NOT NULL,
      "content"	TEXT NOT NULL,
      "state"	TEXT NOT NULL,
      "userId"	TEXT NOT NULL,
      PRIMARY KEY("position","userId")
      FOREIGN KEY("userId") REFERENCES "${userStore.table}" ON DELETE CASCADE
    );`
  );
};