import sodium from "@serenity-tools/libsodium";
import { createDevice } from "../createDevice/createDevice";
import { createEncryptionKeyFromOpaqueExportKey } from "../createEncryptionKeyFromOpaqueExportKey/createEncryptionKeyFromOpaqueExportKey";

export const createAndEncryptDevice = async (exportKey: string) => {
  const { encryptionKey, encryptionKeySalt } =
    await createEncryptionKeyFromOpaqueExportKey(exportKey);
  const {
    signingPublicKey,
    signingPrivateKey,
    encryptionPublicKey,
    encryptionPrivateKey,
    encryptionPublicKeySignature,
  } = await createDevice();
  const nonce = await sodium.randombytes_buf(
    sodium.crypto_secretbox_NONCEBYTES
  );
  const privateKeyPairString = JSON.stringify({
    signingPrivateKey,
    encryptionPrivateKey,
  });
  const privateKeyPairStringBase64 = sodium.to_base64(privateKeyPairString);
  const ciphertext = await sodium.crypto_secretbox_easy(
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
