import sodium from "@serenity-tools/libsodium";
import { createDevice } from "../createDevice/createDevice";
import { createEncryptionKeyFromOpaqueExportKey } from "../createEncryptionKeyFromOpaqueExportKey/createEncryptionKeyFromOpaqueExportKey";

export const createAndEncryptDevice = async (exportKey: string) => {
  const { encryptionKey, encryptionKeySalt } =
    await createEncryptionKeyFromOpaqueExportKey(exportKey);
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
  const ciphertext = await sodium.crypto_secretbox_easy(
    privateKeyPairStringBase64,
    nonce,
    encryptionKey
  );

  console.log("register exportKey", exportKey);
  console.log("register encryptionKeySalt", encryptionKeySalt);
  console.log("register encryptionKey", encryptionKey);

  return {
    ciphertext,
    nonce,
    encryptionPublicKeySignature,
    signingPublicKey: signingKeyPair.publicKey,
    signingPrivateKey: signingKeyPair.privateKey,
    encryptionPublicKey: encryptionKeyPair.publicKey,
    encryptionPrivateKey: encryptionKeyPair.privateKey,
    encryptionKeySalt,
  };
};
