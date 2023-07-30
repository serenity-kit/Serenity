import sodium from "react-native-libsodium";
import { createDevice } from "../createDevice/createDevice";
import { kdfDeriveFromKey } from "../kdfDeriveFromKey/kdfDeriveFromKey";

export const createAndEncryptDevice = (exportKey: string) => {
  const { key: encryptionKey } = kdfDeriveFromKey({
    key: sodium.to_base64(
      sodium.from_base64(exportKey).subarray(0, sodium.crypto_kdf_KEYBYTES)
    ),
    context: "m_device",
    subkeyId: 1111,
  });
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
