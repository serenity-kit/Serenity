import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
import { Snapshot, SnapshotWithClientData } from "@serenity-tools/secsync";
import { z } from "zod";

export const KeyDerivationContext = z.union([
  z.literal("comment_"),
  z.literal("doctitle"),
  z.literal("snapshot"),
  z.literal("wsinvite"),
  z.literal("folder__"),
  z.literal("m_device"),
  z.literal("session_datetime"),
  z.literal("session_token"),
]);
export type KeyDerivationContext = z.infer<typeof KeyDerivationContext>;

export const KeyDerivationTraceEntry = z.object({
  entryId: z.string(), // didn't use id because it often GraphQL clients normalize by the id field
  subkeyId: z.string(),
  parentId: z.union([z.string(), z.null(), z.undefined()]), // the first entry has no parent
  // should be, but causes too many issues with GraphQL KeyDerivationContext,
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
  documentChainEventHash: z.string(),
  workspaceMemberDevicesProof:
    workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProof,
});

export type SerenitySnapshotPublicData = z.infer<
  typeof SerenitySnapshotPublicData
>;

export type SerenitySnapshot = Snapshot & {
  publicData: Snapshot["publicData"] & SerenitySnapshotPublicData;
};

export type DocumentShareLinkDeviceBox = {
  ciphertext: string;
  nonce: string;
  deviceSigningPublicKey: string;
};

export type SerenitySnapshotWithClientData = SnapshotWithClientData & {
  publicData: Snapshot["publicData"] & SerenitySnapshotPublicData;
  additionalServerData: {
    documentTitleData: {
      ciphertext: string;
      nonce: string;
      subkeyId: string;
      workspaceKeyId: string;
      signature: string;
      workspaceMemberDevicesProofHash: string;
    };
    documentShareLinkDeviceBoxes: DocumentShareLinkDeviceBox[];
  };
};

export const ShareDocumentRole = z.union([
  z.literal("VIEWER"),
  z.literal("COMMENTER"),
  z.literal("EDITOR"),
]);

export type ShareDocumentRole = z.infer<typeof ShareDocumentRole>;

export const Comment = z.object({
  text: z.string(),
  from: z.record(z.string(), z.any()),
  to: z.record(z.string(), z.any()),
});

export type Comment = z.infer<typeof Comment>;
