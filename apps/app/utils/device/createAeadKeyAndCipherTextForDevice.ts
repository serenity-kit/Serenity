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
  console.log("creating aeadkey and ciphertext");
  console.log({ deviceEncryptionPublicKey, ciphertext, aeadKey, key });
  return {
    aeadKey: key,
    ciphertext,
  };
};
