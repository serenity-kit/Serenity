export type Device = {
  signingPublicKey: string;
  encryptionPublicKey: string;
  encryptionPublicKeySignature: string;
};

export type LocalDevice = {
  signingPublicKey: string;
  signingPrivateKey: string;
  encryptionPublicKey: string;
  encryptionPrivateKey: string;
  encryptionPublicKeySignature: string;
};
