export type RecoveryDevice = {
  deviceSigningPublicKey: string;
  deviceEncryptionPublicKey: string;
  signatureForMainDeviceSigningPublicKey: string;
  signatureForRecoveryDeviceSigningPublicKey: string;
};
