import sodium from "@serenity-tools/libsodium";
import { Device } from "../types";

export const verifyDevice = (device: Device) => {
  const valid = sodium.crypto_sign_verify_detached(
    device.encryptionPublicKeySignature,
    device.encryptionPublicKey,
    device.signingPublicKey
  );
  if (!valid) {
    throw new Error("Invalid device encryptionPublicKey signature");
  }
};
