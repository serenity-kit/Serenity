import {
  LocalDevice,
  decryptDocumentTitle,
  generateId,
} from "@serenity-tools/common";
import { useSyncExternalStore } from "react";
import {
  runDocumentQuery,
  runSnapshotQuery,
  runWorkspaceQuery,
} from "../generated/graphql";
import * as sql from "./sql/sql";

export const table = "document_v2";

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

export const wipeCaches = () => {};

export const createOrReplaceDocument = ({
  documentId,
  name,
  content,
  triggerRerender,
}: {
  documentId: string;
  name?: string;
  content?: Uint8Array;
  triggerRerender?: boolean;
}) => {
  const existingDocument = getLocalDocument({ documentId });
  sql.execute(`INSERT OR REPLACE INTO ${table} VALUES (?, ?, ?);`, [
    documentId,
    name || existingDocument?.name || null,
    content || existingDocument?.content || null,
  ]);

  sql.triggerDebouncedDatabasePersisting();
  if (name && triggerRerender !== false) {
    triggerGetDocumentName({ documentId });
  }
};

export const getLocalDocument = ({ documentId }: { documentId: string }) => {
  // TODO create helper to get one
  const documentResult = sql.execute(
    `SELECT * FROM ${table} WHERE documentId = ?`,
    [documentId]
  ) as any;
  const document =
    documentResult.length > 0
      ? ({
          ...documentResult[0],
          content:
            documentResult[0].content instanceof Uint8Array
              ? documentResult[0].content
              : new Uint8Array(documentResult[0].content),
        } as DocumentEntry)
      : undefined;

  return document;
};

export const getLocalDocumentName = ({
  documentId,
}: {
  documentId: string;
}) => {
  const document = getLocalDocument({ documentId });
  return document && document.name ? document.name : "loading…";
};

const getLocalDocumentNameListeners: {
  [documentId: string]: { [listenerId: string]: () => void };
} = {};
export const triggerGetDocumentName = ({
  documentId,
}: {
  documentId: string;
}) => {
  Object.values(getLocalDocumentNameListeners[documentId] || []).forEach(
    (listener) => {
      listener();
    }
  );
};

export const useLocalDocumentName = ({
  documentId,
}: {
  documentId: string;
}) => {
  const result = useSyncExternalStore(
    (onStoreChange) => {
      const id = generateId();
      const existing = getLocalDocumentNameListeners[documentId] || {};
      getLocalDocumentNameListeners[documentId] = {
        ...existing,
        [id]: onStoreChange,
      };
      return () => {
        delete getLocalDocumentNameListeners[documentId][id];
      };
    },
    () => {
      const name = getLocalDocumentName({ documentId });
      return name;
    }
  );

  return result;
};

export const loadRemoteDocumentName = async ({
  workspaceId,
  documentId,
  activeDevice,
}: {
  workspaceId: string;
  documentId: string;
  activeDevice: LocalDevice;
}) => {
  const documentQueryResult = await runDocumentQuery({ id: documentId });
  const snapshotQueryResult = await runSnapshotQuery({
    documentId: documentId,
  });

  const workspaceResult = await runWorkspaceQuery({
    id: workspaceId,
    deviceSigningPublicKey: activeDevice.signingPublicKey,
  });

  let name = "loading…";
  if (
    documentQueryResult.data?.document &&
    snapshotQueryResult.data?.snapshot &&
    workspaceResult.data?.workspace
  ) {
    const document = documentQueryResult.data.document;
    const snapshot = snapshotQueryResult.data.snapshot;
    const workspace = workspaceResult.data.workspace;

    let documentWorkspaceKey: any = undefined;
    for (const workspaceKey of workspace.workspaceKeys!) {
      if (workspaceKey.id === snapshot.keyDerivationTrace.workspaceKeyId) {
        documentWorkspaceKey = workspaceKey;
      }
    }

    name = decryptDocumentTitle({
      ciphertext: document.nameCiphertext,
      nonce: document.nameNonce,
      activeDevice,
      subkeyId: document.subkeyId,
      snapshot: {
        keyDerivationTrace: snapshot.keyDerivationTrace,
      },
      workspaceKeyBox: documentWorkspaceKey.workspaceKeyBox,
      workspaceId,
      workspaceKeyId: documentWorkspaceKey.id,
    });
    createOrReplaceDocument({ documentId, name });
  }

  return name;
};
