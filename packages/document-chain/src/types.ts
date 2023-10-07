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

export const CreateDocumentChainTransaction = z.object({
  type: z.literal("create"),
  id: z.string(),
  prevEventHash: z.null(), //there is no previous hash for the first event
  version: Version,
});
export type CreateDocumentChainTransaction = z.infer<
  typeof CreateDocumentChainTransaction
>;

export const CreateDocumentChainEvent = z.object({
  author: Author,
  transaction: CreateDocumentChainTransaction,
});
export type CreateDocumentChainEvent = z.infer<typeof CreateDocumentChainEvent>;

export const AddShareDocumentDeviceTransaction = TransactionBase.extend({
  type: z.literal("add-share-document-device"),
  signingPublicKey: z.string(),
  encryptionPublicKey: z.string(),
  encryptionPublicKeySignature: z.string(),
  role: DocumentShareRole,
  expiresAt: z.optional(z.string().datetime()),
});
export type AddShareDocumentDeviceTransaction = z.infer<
  typeof AddShareDocumentDeviceTransaction
>;

export const AddShareDocumentDeviceEvent = z.object({
  author: Author,
  transaction: AddShareDocumentDeviceTransaction,
});
export type AddShareDocumentDeviceEvent = z.infer<
  typeof AddShareDocumentDeviceEvent
>;

export const RemoveShareDocumentDeviceTransaction = TransactionBase.extend({
  type: z.literal("remove-share-document-device"),
  signingPublicKey: z.string(),
});
export type RemoveShareDocumentDeviceTransaction = z.infer<
  typeof RemoveShareDocumentDeviceTransaction
>;

export const RemoveShareDocumentDeviceEvent = z.object({
  author: Author,
  transaction: RemoveShareDocumentDeviceTransaction,
});
export type RemoveShareDocumentDeviceEvent = z.infer<
  typeof RemoveShareDocumentDeviceEvent
>;

export const UpdateChainEvent = z.union([
  AddShareDocumentDeviceEvent,
  RemoveShareDocumentDeviceEvent,
]);
export type UpdateChainEvent = z.infer<typeof UpdateChainEvent>;

export const DocumentChainEvent = z.union([
  CreateDocumentChainEvent,
  UpdateChainEvent,
]);
export type DocumentChainEvent = z.infer<typeof DocumentChainEvent>;

export const ShareDocumentDeviceInfo = z.object({
  expiresAt: z.optional(z.string().datetime()),
  encryptionPublicKey: z.string(),
  role: DocumentShareRole,
});
export type ShareDocumentDeviceInfo = z.infer<typeof ShareDocumentDeviceInfo>;

export const DocumentChainState = z.object({
  id: z.string(),
  devices: z.record(z.string(), ShareDocumentDeviceInfo),
  removedDevices: z.record(z.string(), ShareDocumentDeviceInfo),
  eventHash: z.string(),
  eventVersion: Version,
});
export type DocumentChainState = z.infer<typeof DocumentChainState>;
