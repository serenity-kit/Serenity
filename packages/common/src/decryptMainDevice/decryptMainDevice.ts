import sodium from "react-native-libsodium";
import { kdfDeriveFromKey } from "../kdfDeriveFromKey/kdfDeriveFromKey";
import { LocalDevice } from "../types";

export const decryptMainDevice = ({
  ciphertext,
  nonce,
  exportKey,
}): LocalDevice => {
  const { key: encryptionKey } = kdfDeriveFromKey({
    key: exportKey,
    context: "m_device",
    subkeyId: "AAAAAAAAAAAAAAAAAAAAAA",
  });
  const decryptedCiphertextBase64 = sodium.crypto_secretbox_open_easy(
    sodium.from_base64(ciphertext),
    sodium.from_base64(nonce),
    sodium.from_base64(encryptionKey)
  );
  const deviceString = sodium.to_string(decryptedCiphertextBase64);
  const device = JSON.parse(deviceString);
  return {
    signingPrivateKey: device.signingPrivateKey,
    signingPublicKey: device.signingPublicKey,
    encryptionPrivateKey: device.encryptionPrivateKey,
    encryptionPublicKey: device.encryptionPublicKey,
    encryptionPublicKeySignature: device.encryptionPublicKeySignature,
    createdAt: device.createdAt,
  };
};
