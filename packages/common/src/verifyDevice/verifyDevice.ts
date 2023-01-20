import sodium from "react-native-libsodium";
import { Device } from "../types";

export const verifyDevice = (device: Device) => {
  const valid = sodium.crypto_sign_verify_detached(
    sodium.from_base64(device.encryptionPublicKeySignature),
    sodium.from_base64(device.encryptionPublicKey),
    sodium.from_base64(device.signingPublicKey)
  );
  if (!valid) {
    throw new Error("Invalid device encryptionPublicKey signature");
  }
};
