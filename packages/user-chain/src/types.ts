import { z } from "zod";

export const Version = z.number().int().nonnegative();

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
  email: z.string().email(),
  encryptionPublicKey: z.string(),
  encryptionPublicKeySignature: z.string(),
  version: Version,
});
export type CreateChainTransaction = z.infer<typeof CreateChainTransaction>;

export const CreateChainEvent = z.object({
  author: Author,
  transaction: CreateChainTransaction,
});
export type CreateChainEvent = z.infer<typeof CreateChainEvent>;

export const AddDeviceTransaction = TransactionBase.extend({
  type: z.literal("add-device"),
  signingPublicKey: z.string(),
  encryptionPublicKey: z.string(),
  encryptionPublicKeySignature: z.string(),
  expiresAt: z.optional(z.string().datetime()),
});
export type AddDeviceTransaction = z.infer<typeof AddDeviceTransaction>;

export const AddDeviceEvent = z.object({
  author: Author,
  transaction: AddDeviceTransaction,
});
export type AddDeviceEvent = z.infer<typeof AddDeviceEvent>;

export const RemoveDeviceTransaction = TransactionBase.extend({
  type: z.literal("remove-device"),
  signingPublicKey: z.string(),
});
export type RemoveDeviceTransaction = z.infer<typeof RemoveDeviceTransaction>;

export const RemoveDeviceEvent = z.object({
  author: Author,
  transaction: RemoveDeviceTransaction,
});
export type RemoveDeviceEvent = z.infer<typeof RemoveDeviceEvent>;

export const UpdateChainEvent = z.union([AddDeviceEvent, RemoveDeviceEvent]);
export type UpdateChainEvent = z.infer<typeof UpdateChainEvent>;

export const UserChainEvent = z.union([CreateChainEvent, UpdateChainEvent]);
export type UserChainEvent = z.infer<typeof UserChainEvent>;

export const DeviceInfo = z.object({
  expiresAt: z.optional(z.string().datetime()),
  encryptionPublicKey: z.string(),
});
export type DeviceInfo = z.infer<typeof DeviceInfo>;

export const UserChainState = z.object({
  id: z.string(),
  email: z.string().email(),
  mainDeviceSigningPublicKey: z.string(),
  mainDeviceEncryptionPublicKey: z.string(),
  mainDeviceEncryptionPublicKeySignature: z.string(),
  devices: z.record(z.string(), DeviceInfo),
  removedDevices: z.record(z.string(), DeviceInfo),
  eventHash: z.string(),
  eventVersion: Version,
});
export type UserChainState = z.infer<typeof UserChainState>;
