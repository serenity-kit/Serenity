import { createEncryptionKeyFromOpaqueExportKey } from "../createEncryptionKeyFromOpaqueExportKey/createEncryptionKeyFromOpaqueExportKey";
import sodium from "@serenity-tools/libsodium";

type PrivateKeys = {
  encryptionPrivateKey: string;
  signingPrivateKey: string;
};

export const decryptDevice = async ({
  ciphertext,
  nonce,
  exportKey,
  encryptionKeySalt,
}): Promise<PrivateKeys> => {
  const { encryptionKey } = await createEncryptionKeyFromOpaqueExportKey(
    exportKey,
    encryptionKeySalt
  );
  console.log("login exportKey", exportKey);
  console.log("login encryptionKeySalt", encryptionKeySalt);
  console.log("login encryptionKey", encryptionKey);

  const decryptedCiphertextBase64 = await sodium.crypto_secretbox_open_easy(
    ciphertext,
    nonce,
    encryptionKey
  );
  const privateKeyPairString = sodium.from_base64_to_string(
    decryptedCiphertextBase64
  );
  const privateKeyPairs = JSON.parse(privateKeyPairString);
  return {
    encryptionPrivateKey: privateKeyPairs.encryptionPrivateKey,
    signingPrivateKey: privateKeyPairs.signingPrivateKey,
  };
};
