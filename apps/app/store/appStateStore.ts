import * as sql from "./sql/sql";

export const table = "app_store_v1";

export const initialize = () => {
  sql.execute(
    `CREATE TABLE IF NOT EXISTS "${table}" (
      "id"	TEXT NOT NULL,
      "lastOpenWorkspaceId"	TEXT NOT NULL,
      PRIMARY KEY("id")
    );`
  );
};

export const wipeCaches = () => {};

type AppState = {
  id: string;
  lastOpenWorkspaceId: string;
};

export const updateLastOpenWorkspaceId = (workspaceId: string) => {
  sql.execute(
    `INSERT INTO "${table}" (id, lastOpenWorkspaceId)
      VALUES (?, ?)
      ON CONFLICT(id) DO UPDATE SET
      lastOpenWorkspaceId = excluded.lastOpenWorkspaceId`,
    ["app", workspaceId]
  );
};

export const getLastOpenWorkspaceId = (): string => {
  const appState = sql.execute(
    `SELECT * FROM ${table} WHERE id = "app"`
  ) as AppState[];
  return appState[0]?.lastOpenWorkspaceId;
};
