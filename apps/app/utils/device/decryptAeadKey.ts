import sodium from "@serenity-tools/libsodium";

export type Props = {
  ciphertext: string;
  deviceEncryptionPublicKey: string;
  deviceEncryptionPrivateKey: string;
};
export const decryptAeadkey = async ({
  ciphertext,
  deviceEncryptionPublicKey,
  deviceEncryptionPrivateKey,
}: Props) => {
  const aeadKey = await sodium.crypto_box_seal_open(
    ciphertext,
    deviceEncryptionPublicKey,
    deviceEncryptionPrivateKey
  );
  return aeadKey;
};
