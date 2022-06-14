import sodium from "@serenity-tools/libsodium";
import { Device } from "../../../src/types/device";
import { crypto_box_NONCEBYTES } from "libsodium-wrappers";

export type GeneratedDevice = Device & {
  signingPrivateKey: string;
  encryptionPrivateKey: string;
  encryptionPublicKeySignature: string;
  nonce: string;
  ciphertext: string;
};
export const createDevice = async (
  encryptionKey: string
): Promise<GeneratedDevice> => {
  // generate keys
  const signingKeyPair = await sodium.crypto_sign_keypair();
  const encryptionKeyPair = sodium.crypto_box_keypair();
  const encryptionPublicKeySignature = await sodium.crypto_sign_detached(
    encryptionKeyPair.publicKey,
    signingKeyPair.privateKey
  );
  const nonce = await sodium.randombytes_buf(crypto_box_NONCEBYTES);
  const privateKeyPairString = JSON.stringify({
    signingPrivateKey: signingKeyPair.privateKey,
    encryptionPrivateKey: encryptionKeyPair.privateKey,
  });
  const privateKeyPairStringBase64 = sodium.to_base64(privateKeyPairString);
  const cipherText = sodium.crypto_secretbox_easy(
    privateKeyPairStringBase64,
    nonce,
    encryptionKey
  );
  return {
    signingPublicKey: signingKeyPair.publicKey,
    encryptionPublicKey: encryptionKeyPair.publicKey,
    encryptionPublicKeySignature,
    nonce,
    ciphertext: cipherText,
    signingPrivateKey: signingKeyPair.privateKey,
    encryptionPrivateKey: encryptionKeyPair.privateKey,
  };
};
