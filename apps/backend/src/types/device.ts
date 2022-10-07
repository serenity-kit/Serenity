import { Session } from "./session";

export type Device = {
  signingPublicKey: string;
  encryptionPublicKey: string;
  encryptionPublicKeySignature: string;
  info?: string | null | undefined;
  createdAt?: Date;
  userId?: string | null;
};

export type DeviceWithRecentSession = Device & {
  mostRecentSession?: Session | null;
};

export type CreatorDevice = {
  signingPublicKey: string;
  encryptionPublicKey: string;
  encryptionPublicKeySignature: string;
  createdAt?: Date;
  userId?: string | null;
};
