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
  const ciphertext = await sodium.crypto_box_seal(
    key,
    deviceEncryptionPublicKey
  );
  return {
    aeadKey: key,
    ciphertext,
  };
};
