import sodium from "@serenity-tools/libsodium";

export type Props = {
  deviceEncryptionPublicKey: string;
};
export const createAeadKeyAndCipherTextForDevice = async ({
  deviceEncryptionPublicKey,
}: Props) => {
  const aeadKey = await sodium.crypto_aead_xchacha20poly1305_ietf_keygen();
  const ciphertext = await sodium.crypto_box_seal(
    aeadKey,
    deviceEncryptionPublicKey
  );
  return {
    aeadKey,
    ciphertext,
  };
};
