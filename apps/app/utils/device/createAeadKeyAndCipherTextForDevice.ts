import sodium from "@serenity-tools/libsodium";

export type Props = {
  deviceEncryptionPublicKey: string;
  aeadKey?: string;
};
export const createAeadKeyAndCipherTextForDevice = async ({
  deviceEncryptionPublicKey,
  aeadKey,
}: Props) => {
  let key = aeadKey;
  if (!key) {
    key = await sodium.crypto_aead_xchacha20poly1305_ietf_keygen();
  }
  const nonce = await sodium.randombytes_buf(
    sodium.crypto_secretbox_NONCEBYTES
  );
  const ciphertext = await sodium.crypto_secretbox_easy(
    key,
    nonce,
    deviceEncryptionPublicKey
  );
  return {
    aeadKey: key,
    nonce,
    ciphertext,
  };
};
