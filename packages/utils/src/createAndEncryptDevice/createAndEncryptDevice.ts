import sodium from "@serenity-tools/libsodium";
import { createDevice } from "../createDevice/createDevice";

export const createAndEncryptDevice = async (encryptionKey: string) => {
  const { signingKeyPair, encryptionKeyPair, encryptionPublicKeySignature } =
    await createDevice();
  const nonce = await sodium.randombytes_buf(
    sodium.crypto_secretbox_NONCEBYTES
  );
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
    cipherText,
    nonce,
    encryptionPublicKeySignature,
    signingKeyPair,
    encryptionKeyPair,
  };
};
