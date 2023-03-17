import { z } from "zod";

const KeyDerivationTraceEntry = z.object({
  entryId: z.string(), // didn't use id because it often GraphQL clients normalize by the id field
  subkeyId: z.number(),
  parentId: z.union([z.string(), z.null(), z.undefined()]), // the first entry has no parent
  context: z.string(), // kdf context
});

export type KeyDerivationTraceEntry = z.infer<typeof KeyDerivationTraceEntry>;

const KeyDerivationTraceEntryWithKey = KeyDerivationTraceEntry.extend({
  key: z.string(),
});

export type KeyDerivationTraceEntryWithKey = z.infer<
  typeof KeyDerivationTraceEntryWithKey
>;

const KeyDerivationTrace2 = z.object({
  workspaceKeyId: z.string(),
  trace: z.array(KeyDerivationTraceEntry),
});

export type KeyDerivationTrace2 = z.infer<typeof KeyDerivationTrace2>;

export type KeyDerivationTraceWithKeys = {
  workspaceKeyId: string;
  trace: KeyDerivationTraceEntryWithKey[];
};

export interface SnapshotPublicData {
  docId: string;
  pubKey: string; // public signing key
  snapshotId: string;
  subkeyId: number;
  keyDerivationTrace: KeyDerivationTrace2;
}

export interface SnapshotServerData {
  latestVersion: number;
}

export interface UpdatePublicData {
  docId: string;
  pubKey: string; // public signing key
  refSnapshotId: string;
}

export interface UpdatePublicDataWithClock {
  docId: string;
  pubKey: string; // public signing key
  refSnapshotId: string;
  clock: number;
}

export interface UpdateServerData {
  version: number;
}

export interface AwarenessUpdatePublicData {
  docId: string;
  pubKey: string; // public signing key
}

export interface Snapshot {
  ciphertext: string;
  nonce: string;
  signature: string; // ciphertext + nonce + publicData
  publicData: SnapshotPublicData;
}

export interface SnapshotWithServerData extends Snapshot {
  serverData: SnapshotServerData;
}

export interface Update {
  ciphertext: string;
  nonce: string;
  signature: string; // ciphertext + nonce + publicData
  publicData: UpdatePublicDataWithClock;
}

export interface UpdateWithServerData extends Snapshot {
  serverData: UpdateServerData;
}

export interface AwarenessUpdate {
  ciphertext: string;
  nonce: string;
  signature: string; // ciphertext + nonce + publicData
  publicData: AwarenessUpdatePublicData;
}

export type ClientEvent = Snapshot | Update | AwarenessUpdate;

export type ServerEvent =
  | SnapshotWithServerData
  | UpdateWithServerData
  | AwarenessUpdate;
