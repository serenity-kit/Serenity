import sodium from "react-native-libsodium";
import { createEncryptionKeyFromOpaqueExportKey } from "../createEncryptionKeyFromOpaqueExportKey/createEncryptionKeyFromOpaqueExportKey";

type PrivateKeys = {
  encryptionPrivateKey: string;
  signingPrivateKey: string;
};

export const decryptDevice = ({
  ciphertext,
  nonce,
  exportKey,
  encryptionKeySalt,
}): PrivateKeys => {
  const { encryptionKey } = createEncryptionKeyFromOpaqueExportKey(
    exportKey,
    encryptionKeySalt
  );
  const decryptedCiphertextBase64 = sodium.crypto_secretbox_open_easy(
    sodium.from_base64(ciphertext),
    sodium.from_base64(nonce),
    sodium.from_base64(encryptionKey)
  );
  const privateKeyPairString = sodium.to_string(decryptedCiphertextBase64);
  const privateKeyPairs = JSON.parse(privateKeyPairString);
  return {
    encryptionPrivateKey: privateKeyPairs.encryptionPrivateKey,
    signingPrivateKey: privateKeyPairs.signingPrivateKey,
  };
};
