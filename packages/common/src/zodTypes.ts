import { Snapshot, SnapshotWithClientData } from "@serenity-tools/secsync";
import { z } from "zod";

export const KeyDerivationTraceEntry = z.object({
  entryId: z.string(), // didn't use id because it often GraphQL clients normalize by the id field
  subkeyId: z.number(),
  parentId: z.union([z.string(), z.null(), z.undefined()]), // the first entry has no parent
  context: z.string(), // kdf context
});

export const KeyDerivationTraceEntryWithKey = KeyDerivationTraceEntry.extend({
  key: z.string(),
});

export type KeyDerivationTraceEntryWithKey = z.infer<
  typeof KeyDerivationTraceEntryWithKey
>;

export type KeyDerivationTraceEntry = z.infer<typeof KeyDerivationTraceEntry>;

export const KeyDerivationTrace = z.object({
  workspaceKeyId: z.string(),
  trace: z.array(KeyDerivationTraceEntry),
});

export const KeyDerivationTraceWithKeys = z.object({
  workspaceKeyId: z.string(),
  trace: z.array(KeyDerivationTraceEntryWithKey),
});

export type KeyDerivationTraceWithKeys = z.infer<
  typeof KeyDerivationTraceWithKeys
>;

export type KeyDerivationTrace = z.infer<typeof KeyDerivationTrace>;

export const SerenitySnapshotPublicData = z.object({
  keyDerivationTrace: KeyDerivationTrace,
});

export type SerenitySnapshotPublicData = z.infer<
  typeof SerenitySnapshotPublicData
>;

export type SerenitySnapshot = Snapshot & {
  publicData: Snapshot["publicData"] & SerenitySnapshotPublicData;
};

export type SerenitySnapshotWithClientData = SnapshotWithClientData & {
  publicData: SnapshotWithClientData["publicData"] & SerenitySnapshotPublicData;
};
