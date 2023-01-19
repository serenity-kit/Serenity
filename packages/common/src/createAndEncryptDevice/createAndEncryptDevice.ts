import sodium from "@serenity-tools/libsodium";
import { createDevice } from "../createDevice/createDevice";
import { createEncryptionKeyFromOpaqueExportKey } from "../createEncryptionKeyFromOpaqueExportKey/createEncryptionKeyFromOpaqueExportKey";

export const createAndEncryptDevice = (exportKey: string) => {
  const { encryptionKey, encryptionKeySalt } =
    createEncryptionKeyFromOpaqueExportKey(exportKey);
  const {
    signingPublicKey,
    signingPrivateKey,
    encryptionPublicKey,
    encryptionPrivateKey,
    encryptionPublicKeySignature,
  } = createDevice();
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  const privateKeyPairString = JSON.stringify({
    signingPrivateKey,
    encryptionPrivateKey,
  });
  const privateKeyPairStringBase64 = sodium.to_base64(privateKeyPairString);
  const ciphertext = sodium.crypto_secretbox_easy(
    privateKeyPairStringBase64,
    nonce,
    encryptionKey
  );

  return {
    ciphertext,
    nonce,
    encryptionPublicKeySignature,
    signingPublicKey,
    signingPrivateKey,
    encryptionPublicKey,
    encryptionPrivateKey,
    encryptionKeySalt,
  };
};
