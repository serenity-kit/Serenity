import sodium from "react-native-libsodium";
import { kdfDeriveFromKey } from "../kdfDeriveFromKey/kdfDeriveFromKey";

type PrivateKeys = {
  encryptionPrivateKey: string;
  signingPrivateKey: string;
};

export const decryptDevice = ({
  ciphertext,
  nonce,
  exportKey,
}): PrivateKeys => {
  const { key: encryptionKey } = kdfDeriveFromKey({
    key: sodium.to_base64(
      sodium.from_base64(exportKey).subarray(0, sodium.crypto_kdf_KEYBYTES)
    ),
    context: "m_device",
    subkeyId: 1111,
  });
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
