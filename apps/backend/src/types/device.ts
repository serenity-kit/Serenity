export type Device = {
  userId: string;
  signingPublicKey: string;
  signingPrivateKey?: string;
  signingKeyType: string;
  encryptionPublicKey: string;
  encryptionPrivateKey?: string;
  encryptionKeyType: string;
  encryptionPublicKeySignature: string;
};
