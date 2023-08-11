export type Device = {
  signingPublicKey: string;
  encryptionPublicKey: string;
  encryptionPublicKeySignature: string;
  info?: string | null | undefined;
  createdAt?: Date;
  userId?: string | null;
  expiresAt?: Date;
};

export type CreatorDevice = {
  signingPublicKey: string;
  encryptionPublicKey: string;
  encryptionPublicKeySignature: string;
  createdAt?: Date;
  userId?: string | null;
};

export type MinimalDevice = {
  signingPublicKey: string;
  encryptionPublicKey: string;
  encryptionPublicKeySignature: string;
};
