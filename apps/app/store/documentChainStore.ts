import * as documentChain from "@serenity-kit/document-chain";
import { notNull } from "@serenity-tools/common";
import canonicalize from "canonicalize";
import sodium from "react-native-libsodium";
import { runDocumentChainQuery } from "../generated/graphql";
import { showToast } from "../utils/toast/showToast";
import * as sql from "./sql/sql";

export const table = "document_chain_v1";

type DocumentChainEntry = {
  position: number;
  event: documentChain.DocumentChainEvent;
  state: documentChain.DocumentChainState;
};

// NOT sure if we want a foreign key
// FOREIGN KEY("documentId") REFERENCES "${documentStore.table}" ON DELETE CASCADE

export const initialize = () => {
  sql.execute(
    `CREATE TABLE IF NOT EXISTS "${table}" (
      "position"	INTEGER NOT NULL,
      "content"	TEXT NOT NULL,
      "state"	TEXT NOT NULL,
      "documentId"	TEXT NOT NULL,
      "hash"	TEXT NOT NULL,
      PRIMARY KEY("position","documentId")
    );`
  );
};

export const createDocumentChainEvent = ({
  documentId,
  event,
  state,
  position,
  triggerRerender,
}: {
  documentId: string;
  event: documentChain.DocumentChainEvent;
  state: documentChain.DocumentChainState;
  position: number;
  triggerRerender?: boolean;
}) => {
  sql.execute(`INSERT OR IGNORE INTO ${table} VALUES (?, ?, ?, ?, ?);`, [
    position,
    JSON.stringify(event),
    JSON.stringify(state),
    documentId,
    state.eventHash,
  ]);
  // if (triggerRerender !== false) {
  //   triggerGetLastDocumentChain();
  // }
};

export const getDocumentChainEventByHash = ({
  documentId,
  hash,
}: {
  documentId: string;
  hash: string;
}) => {
  // TODO create helper to get one
  const documentChainEventResult = sql.execute(
    `SELECT * FROM ${table} WHERE documentId = ? AND hash  = ? LIMIT 1`,
    [documentId, hash]
  ) as any;
  const documentChainEvent =
    documentChainEventResult.length > 0
      ? ({
          position: documentChainEventResult[0].position,
          event: JSON.parse(documentChainEventResult[0].content),
          state: JSON.parse(documentChainEventResult[0].state),
        } as DocumentChainEntry)
      : undefined;
  return documentChainEvent;
};

export const getLastDocumentChainEvent = ({
  documentId,
}: {
  documentId: string;
}) => {
  // TODO create helper to get one
  const documentChainEventResult = sql.execute(
    `SELECT * FROM ${table} WHERE documentId = ? ORDER BY position DESC LIMIT 1`,
    [documentId]
  ) as any;
  const documentChainEvent =
    documentChainEventResult.length > 0
      ? ({
          position: documentChainEventResult[0].position,
          event: JSON.parse(documentChainEventResult[0].content),
          state: JSON.parse(documentChainEventResult[0].state),
        } as DocumentChainEntry)
      : undefined;
  return documentChainEvent;
};

export const loadRemoteDocumentChain = async ({
  documentId,
}: {
  documentId: string;
}) => {
  const lastEvent = getLastDocumentChainEvent({ documentId });

  const documentChainQueryResult = await runDocumentChainQuery({
    documentId,
    after: lastEvent
      ? sodium.to_base64(
          lastEvent.position.toString(),
          1 // sodium.base64_variants.ORIGINAL
        )
      : undefined,
  });

  if (documentChainQueryResult.error) {
    showToast("Failed to load necessary document data.", "error");
  }

  if (
    documentChainQueryResult.data?.documentChain?.nodes &&
    documentChainQueryResult.data?.documentChain?.nodes.length > 0
  ) {
    // refactor the following part to be available in the chain API
    const chain =
      documentChainQueryResult.data.documentChain.nodes.filter(notNull);

    let otherRawEvents = chain;
    let state: documentChain.DocumentChainState;

    if (lastEvent) {
      state = lastEvent.state;
    } else {
      const [firstRawEvent, ...rest] = chain;
      otherRawEvents = rest;
      const firstEvent = documentChain.CreateDocumentChainEvent.parse(
        JSON.parse(firstRawEvent.serializedContent)
      );
      state = documentChain.applyCreateDocumentChainEvent({
        event: firstEvent,
        knownVersion: documentChain.version,
      });
      createDocumentChainEvent({
        event: firstEvent,
        documentId,
        state,
        triggerRerender: false,
        position: firstRawEvent.position,
      });
    }

    otherRawEvents.map((rawEvent) => {
      const event = documentChain.UpdateChainEvent.parse(
        JSON.parse(rawEvent.serializedContent)
      );
      state = documentChain.applyEvent({
        state,
        event,
        knownVersion: documentChain.version,
      });
      createDocumentChainEvent({
        event,
        documentId,
        state,
        triggerRerender: false,
        position: rawEvent.position,
      });
    });
    // triggerGetLastDocumentChain();
  }

  return getLastDocumentChainEvent({ documentId });
};

let getDocumentChainEntriesCache: DocumentChainEntry[] = [];
export const getDocumentChainEntries = () => {
  const documentChainEntries = sql.execute(`SELECT * FROM ${table}`);
  if (
    documentChainEntries.length === getDocumentChainEntriesCache.length &&
    canonicalize(documentChainEntries) ===
      canonicalize(getDocumentChainEntriesCache)
  ) {
    return getDocumentChainEntriesCache;
  }
  getDocumentChainEntriesCache = documentChainEntries.map((entry) => {
    return {
      position: entry.position,
      event: JSON.parse(entry.content),
      state: JSON.parse(entry.state),
    } as DocumentChainEntry;
  });
  return getDocumentChainEntriesCache;
};
