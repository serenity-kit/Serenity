import { z } from "zod";

export const KeyDerivationTraceEntry = z.object({
  entryId: z.string(), // didn't use id because it often GraphQL clients normalize by the id field
  subkeyId: z.number(),
  parentId: z.union([z.string(), z.null(), z.undefined()]), // the first entry has no parent
  context: z.string(), // kdf context
});

export type KeyDerivationTraceEntry = z.infer<typeof KeyDerivationTraceEntry>;

export const KeyDerivationTraceEntryWithKey = KeyDerivationTraceEntry.extend({
  key: z.string(),
});

export type KeyDerivationTraceEntryWithKey = z.infer<
  typeof KeyDerivationTraceEntryWithKey
>;

export const KeyDerivationTrace2 = z.object({
  workspaceKeyId: z.string(),
  trace: z.array(KeyDerivationTraceEntry),
});

export type KeyDerivationTrace2 = z.infer<typeof KeyDerivationTrace2>;

export const KeyDerivationTraceWithKeys = z.object({
  workspaceKeyId: z.string(),
  trace: z.array(KeyDerivationTraceEntryWithKey),
});

export type KeyDerivationTraceWithKeys = z.infer<
  typeof KeyDerivationTraceWithKeys
>;

export const SnapshotPublicData = z.object({
  docId: z.string(),
  pubKey: z.string(), // public signing key
  snapshotId: z.string(),
  subkeyId: z.number(),
  keyDerivationTrace: KeyDerivationTrace2,
});

export type SnapshotPublicData = z.infer<typeof SnapshotPublicData>;

export const SnapshotServerData = z.object({
  latestVersion: z.number(),
});

export type SnapshotServerData = z.infer<typeof SnapshotServerData>;

export const UpdatePublicData = z.object({
  docId: z.string(),
  pubKey: z.string(), // public signing key
  refSnapshotId: z.string(),
});

export type UpdatePublicData = z.infer<typeof UpdatePublicData>;

export const UpdatePublicDataWithClock = z.object({
  docId: z.string(),
  pubKey: z.string(), // public signing key
  refSnapshotId: z.string(),
  clock: z.number(),
});

export type UpdatePublicDataWithClock = z.infer<
  typeof UpdatePublicDataWithClock
>;

export const UpdateServerData = z.object({
  version: z.number(),
});

export type UpdateServerData = z.infer<typeof UpdateServerData>;

export const EphemeralUpdatePublicData = z.object({
  docId: z.string(),
  pubKey: z.string(), // public signing key
});

export type EphemeralUpdatePublicData = z.infer<
  typeof EphemeralUpdatePublicData
>;

export const Snapshot = z.object({
  ciphertext: z.string(),
  nonce: z.string(),
  signature: z.string(), // ciphertext + nonce + publicData
  publicData: SnapshotPublicData,
});

export type Snapshot = z.infer<typeof Snapshot>;

export const SnapshotWithServerData = Snapshot.extend({
  serverData: SnapshotServerData,
});

export type SnapshotWithServerData = z.infer<typeof SnapshotWithServerData>;

export const Update = z.object({
  ciphertext: z.string(),
  nonce: z.string(),
  signature: z.string(), // ciphertext + nonce + publicData
  publicData: UpdatePublicDataWithClock,
});

export type Update = z.infer<typeof Update>;

export const UpdateWithServerData = Update.extend({
  serverData: UpdateServerData,
});

export type UpdateWithServerData = z.infer<typeof UpdateWithServerData>;

export const EphemeralUpdate = z.object({
  ciphertext: z.string(),
  nonce: z.string(),
  signature: z.string(), // ciphertext + nonce + publicData
  publicData: EphemeralUpdatePublicData,
});

export type EphemeralUpdate = z.infer<typeof EphemeralUpdate>;

export type ClientEvent = Snapshot | Update | EphemeralUpdate;

export type ServerEvent =
  | SnapshotWithServerData
  | UpdateWithServerData
  | EphemeralUpdate;
