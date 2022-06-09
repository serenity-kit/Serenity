export type RecoveryDevice = {
  userId: string;
  ciphertext: string;
  nonce: string;
  deviceSigningPublicKey: string;
  deviceSigningPrivateKey?: string;
  deviceSigningKeyType: string;
  deviceEncryptionPublicKey?: string;
  deviceEncryptionPrivateKey?: string;
  deviceEncryptionKeyType?: string;
  signatureForMainDeviceSigningPublicKey: string;
  signatureForRecoveryDeviceSigningPublicKey: string;
};
