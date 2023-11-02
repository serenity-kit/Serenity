import * as sql from "./sql/sql";

import * as workspaceStore from "./workspaceStore";

export const table = "workspace_chain_v1";

export const initialize = async () => {
  await sql.ready();

  sql.execute(
    `CREATE TABLE IF NOT EXISTS "${table}" (
      "position"	INTEGER NOT NULL,
      "content"	TEXT NOT NULL,
      "state"	TEXT NOT NULL,
      "workspaceId"	TEXT NOT NULL,
      PRIMARY KEY("position","workspaceId")
      FOREIGN KEY("workspaceId") REFERENCES "${workspaceStore.table}" ON DELETE CASCADE
    );`
  );
};
