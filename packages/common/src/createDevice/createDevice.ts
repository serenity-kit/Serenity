import sodium from "@serenity-tools/libsodium";
import { LocalDevice } from "../types";

export const createDevice = async () => {
  const signingKeyPair = await sodium.crypto_sign_keypair();
  const encryptionKeyPair = await sodium.crypto_box_keypair();
  const encryptionPublicKeySignature = await sodium.crypto_sign_detached(
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
