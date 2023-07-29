import sodium from "react-native-libsodium";
import { createDevice } from "../createDevice/createDevice";
import { createEncryptionKeyFromOpaqueExportKey } from "../createEncryptionKeyFromOpaqueExportKey/createEncryptionKeyFromOpaqueExportKey";

export const createAndEncryptDevice = (exportKey: string) => {
  const { encryptionKey } = createEncryptionKeyFromOpaqueExportKey(exportKey);
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
  const ciphertext = sodium.crypto_secretbox_easy(
    privateKeyPairString,
    nonce,
    sodium.from_base64(encryptionKey)
  );

  return {
    ciphertext: sodium.to_base64(ciphertext),
    nonce: sodium.to_base64(nonce),
    encryptionPublicKeySignature,
    signingPublicKey,
    signingPrivateKey,
    encryptionPublicKey,
    encryptionPrivateKey,
  };
};
