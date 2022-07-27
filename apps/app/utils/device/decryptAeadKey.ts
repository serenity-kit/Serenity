import sodium from "@serenity-tools/libsodium";

export type Props = {
  nonce: string;
  ciphertext: string;
  deviceEncryptionPrivateKey: string;
};
export const decryptAeadkey = async ({
  nonce,
  ciphertext,
  deviceEncryptionPrivateKey,
}: Props) => {
  const aeadKey = await sodium.crypto_secretbox_open_easy(
    ciphertext,
    nonce,
    deviceEncryptionPrivateKey
  );
  return aeadKey;
};
