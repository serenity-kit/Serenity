import sodium from "@serenity-tools/libsodium";

export type Props = {
  receiverDeviceEncryptionPublicKey: string;
  creatorDeviceEncryptionPrivateKey: string;
};
export const createAeadKeyAndCipherTextForDevice = async ({
  receiverDeviceEncryptionPublicKey,
  creatorDeviceEncryptionPrivateKey,
}: Props) => {
  const aeadKey = await sodium.crypto_aead_xchacha20poly1305_ietf_keygen();
  const nonce = await sodium.randombytes_buf(
    sodium.crypto_secretbox_NONCEBYTES
  );
  const ciphertext = await sodium.crypto_box_easy(
    aeadKey,
    nonce,
    receiverDeviceEncryptionPublicKey,
    creatorDeviceEncryptionPrivateKey
  );
  return {
    aeadKey,
    nonce,
    ciphertext,
  };
};
