import sodium from "@serenity-tools/libsodium";

export type Props = {
  deviceEncryptionPublicKey: string;
};
export const createAeadKeyAndCipherTextForDevice = async ({
  deviceEncryptionPublicKey,
}: Props) => {
  const aeadKey = await sodium.crypto_aead_xchacha20poly1305_ietf_keygen();
  const nonce = await sodium.randombytes_buf(
    sodium.crypto_secretbox_NONCEBYTES
  );
  const ciphertext = await sodium.crypto_secretbox_easy(
    aeadKey,
    nonce,
    deviceEncryptionPublicKey
  );
  return {
    aeadKey,
    nonce,
    ciphertext,
  };
};
