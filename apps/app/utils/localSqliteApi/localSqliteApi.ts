import * as SQLite from "expo-sqlite";
import { from_base64, to_base64 } from "react-native-libsodium";
import type { Document } from "./types";

const db = SQLite.openDatabase("serenity.db");

db.transaction((tx) => {
  tx.executeSql(
    `CREATE TABLE IF NOT EXISTS "Document" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "content" TEXT
    );`
  );
});

export const setLocalDocument = async (document: Document) => {
  db.transaction((tx) => {
    tx.executeSql(`REPLACE INTO "Document" VALUES (?, ?)`, [
      document.id,
      to_base64(document.content),
    ]);
  });
};

export const getLocalDocument = async (
  documentId: string
): Promise<Document | undefined> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM "Document" WHERE id = ?`,
        [documentId],
        (_, { rows }) => {
          if (rows.length === 0) {
            resolve(undefined);
          } else {
            resolve({
              id: rows.item(0).id,
              content: from_base64(rows.item(0).content),
            });
          }
        }
      );
    });
  });
};
