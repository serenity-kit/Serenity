import { Session } from "./session";

export type Device = {
  encryptionPrivateKey?: string;
  encryptionPublicKey: string;
  signingPrivateKey?: string;
  signingPublicKey: string;
  encryptionPublicKeySignature?: string;
  createdAt?: Date;
  info?: string | null;
};

export type DeviceWithRecentSession = Device & {
  mostRecentSession?: Session | null;
};
