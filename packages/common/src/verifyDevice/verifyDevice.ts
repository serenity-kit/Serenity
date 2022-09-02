import sodium from "@serenity-tools/libsodium";
import { Device } from "../types";

export const verifyDevice = async (device: Device) => {
  const valid = await sodium.crypto_sign_verify_detached(
    device.encryptionPublicKeySignature,
    device.encryptionPublicKey,
    device.signingPublicKey
  );
  if (!valid) {
    throw new Error("Invalid device encryptionPublicKey signature");
  }
};
