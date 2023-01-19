import sodium from "@serenity-tools/libsodium";

export type Props = {
  receiverDeviceEncryptionPublicKey: string;
  creatorDeviceEncryptionPrivateKey: string;
};
export const createAeadKeyAndCipherTextForDevice = ({
  receiverDeviceEncryptionPublicKey,
  creatorDeviceEncryptionPrivateKey,
}: Props) => {
  const aeadKey = sodium.crypto_aead_xchacha20poly1305_ietf_keygen();
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  const ciphertext = sodium.crypto_box_easy(
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
