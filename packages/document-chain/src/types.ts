import { z } from "zod";

export const Version = z.number().int().nonnegative();

export const DocumentShareRole = z.enum(["EDITOR", "COMMENTER", "VIEWER"]);

export type DocumentShareRole = z.infer<typeof DocumentShareRole>;

export const KeyPairBase64 = z.object({
  privateKey: z.string(),
  publicKey: z.string(),
});
export type KeyPairBase64 = z.infer<typeof KeyPairBase64>;

export const Author = z.object({
  publicKey: z.string(),
  signature: z.string(),
});

export const TransactionBase = z.object({
  prevEventHash: z.string(),
  version: Version,
});

export const CreateChainTransaction = z.object({
  type: z.literal("create"),
  id: z.string(),
  prevEventHash: z.null(), //there is no previous hash for the first event
  version: Version,
});
export type CreateChainTransaction = z.infer<typeof CreateChainTransaction>;

export const CreateChainEvent = z.object({
  author: Author,
  transaction: CreateChainTransaction,
});
export type CreateChainEvent = z.infer<typeof CreateChainEvent>;

export const AddShareDeviceTransaction = TransactionBase.extend({
  type: z.literal("add-share-device"),
  signingPublicKey: z.string(),
  encryptionPublicKey: z.string(),
  encryptionPublicKeySignature: z.string(),
  role: DocumentShareRole,
  expiresAt: z.optional(z.string().datetime()),
});
export type AddShareDeviceTransaction = z.infer<
  typeof AddShareDeviceTransaction
>;

export const AddShareDeviceEvent = z.object({
  author: Author,
  transaction: AddShareDeviceTransaction,
});
export type AddShareDeviceEvent = z.infer<typeof AddShareDeviceEvent>;

export const RemoveShareDeviceTransaction = TransactionBase.extend({
  type: z.literal("remove-share-device"),
  signingPublicKey: z.string(),
});
export type RemoveShareDeviceTransaction = z.infer<
  typeof RemoveShareDeviceTransaction
>;

export const RemoveShareDeviceEvent = z.object({
  author: Author,
  transaction: RemoveShareDeviceTransaction,
});
export type RemoveShareDeviceEvent = z.infer<typeof RemoveShareDeviceEvent>;

export const UpdateChainEvent = z.union([
  AddShareDeviceEvent,
  RemoveShareDeviceEvent,
]);
export type UpdateChainEvent = z.infer<typeof UpdateChainEvent>;

export const DocumentChainEvent = z.union([CreateChainEvent, UpdateChainEvent]);
export type DocumentChainEvent = z.infer<typeof DocumentChainEvent>;

export const ShareDeviceInfo = z.object({
  expiresAt: z.optional(z.string().datetime()),
  encryptionPublicKey: z.string(),
  role: DocumentShareRole,
});
export type ShareDeviceInfo = z.infer<typeof ShareDeviceInfo>;

export const DocumentChainState = z.object({
  id: z.string(),
  devices: z.record(z.string(), ShareDeviceInfo),
  removedDevices: z.record(z.string(), ShareDeviceInfo),
  eventHash: z.string(),
  eventVersion: Version,
});
export type DocumentChainState = z.infer<typeof DocumentChainState>;
