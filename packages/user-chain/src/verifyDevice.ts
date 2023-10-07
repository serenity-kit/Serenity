import sodium from "react-native-libsodium";
import { userDeviceEncryptionPublicKeyDomainContext } from "./constants";

export type VerifyDeviceParams = {
  signingPublicKey: string;
  encryptionPublicKey: string;
  encryptionPublicKeySignature: string;
};

export const verifyDevice = (device: VerifyDeviceParams) => {
  const valid = sodium.crypto_sign_verify_detached(
    sodium.from_base64(device.encryptionPublicKeySignature),
    userDeviceEncryptionPublicKeyDomainContext + device.encryptionPublicKey,
    sodium.from_base64(device.signingPublicKey)
  );
  if (!valid) {
    throw new Error("Invalid device encryptionPublicKey signature");
  }
};
