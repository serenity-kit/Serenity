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

export const KeyDerivationTrace = z.object({
  workspaceKeyId: z.string(),
  trace: z.array(KeyDerivationTraceEntry),
});

export type KeyDerivationTrace = z.infer<typeof KeyDerivationTrace>;

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
  keyDerivationTrace: KeyDerivationTrace,
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

export const SnapshotWithClientData = Snapshot.extend({
  lastKnownSnapshotId: z.string().nullable().optional(),
  latestServerVersion: z.number().nullable().optional(),
  additionalServerData: z.unknown().optional(),
});

export type SnapshotWithClientData = z.infer<typeof SnapshotWithClientData>;

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

export const ClientEvent = z.union([Snapshot, Update, EphemeralUpdate]);

export type ClientEvent = z.infer<typeof ClientEvent>;

export const ServerEvent = z.union([
  SnapshotWithServerData,
  UpdateWithServerData,
  EphemeralUpdate,
]);

export type ServerEvent = z.infer<typeof ServerEvent>;

export const SnapshotFailedEvent = z.object({
  type: z.literal("snapshotFailed"),
  snapshot: z.optional(SnapshotWithServerData),
  updates: z.array(UpdateWithServerData).optional(),
});

export type SnapshotFailedEvent = z.infer<typeof SnapshotFailedEvent>;
