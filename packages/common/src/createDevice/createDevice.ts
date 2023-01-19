import sodium from "@serenity-tools/libsodium";
import { LocalDevice } from "../types";

export const createDevice = () => {
  const signingKeyPair = sodium.crypto_sign_keypair();
  const encryptionKeyPair = sodium.crypto_box_keypair();
  const encryptionPublicKeySignature = sodium.crypto_sign_detached(
    encryptionKeyPair.publicKey,
    signingKeyPair.privateKey
  );
  const device: LocalDevice = {
    signingPublicKey: signingKeyPair.publicKey,
    signingPrivateKey: signingKeyPair.privateKey,
    encryptionPublicKey: encryptionKeyPair.publicKey,
    encryptionPrivateKey: encryptionKeyPair.privateKey,
    encryptionPublicKeySignature,
  };
  return device;
};
