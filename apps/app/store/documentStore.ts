import * as sql from "./sql/sql";

export const table = "document_v1";

type DocumentEntry = {
  documentId: string;
  name: string | null;
  content: Uint8Array | null;
};

export const initialize = () => {
  sql.execute(
    `CREATE TABLE IF NOT EXISTS "${table}" (
      "documentId"	TEXT NOT NULL,
      "name"	TEXT,
      "content"	BLOB,
      PRIMARY KEY("documentId")
    );`
  );
};

export const createOrReplaceDocument = ({
  documentId,
  name,
  content,
}: {
  documentId: string;
  name?: string;
  content?: Uint8Array;
  triggerRerender?: boolean;
}) => {
  sql.execute(`INSERT OR REPLACE INTO ${table} VALUES (?, ?, ?);`, [
    documentId,
    name || null,
    content || null,
  ]);
  sql.triggerDebouncedDatabasePersisting();
};

export const getLocalDocument = ({ documentId }: { documentId: string }) => {
  // TODO create helper to get one
  const documentResult = sql.execute(
    `SELECT * FROM ${table} WHERE documentId = ?`,
    [documentId]
  ) as any;
  return documentResult.length > 0
    ? (documentResult[0] as DocumentEntry)
    : undefined;
};
