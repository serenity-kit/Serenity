import sodium from "@serenity-tools/libsodium";

export type Props = {
  receiverDeviceEncryptionPublicKey: string;
  creatorDeviceEncryptionPrivateKey: string;
  aeadKey?: string;
  nonce?: string;
};
export const createAeadKeyAndCipherTextForDevice = async ({
  receiverDeviceEncryptionPublicKey,
  creatorDeviceEncryptionPrivateKey,
  aeadKey,
  nonce,
}: Props) => {
  let key = aeadKey;
  if (!key) {
    key = await sodium.crypto_aead_xchacha20poly1305_ietf_keygen();
  }
  let theNonce = nonce;
  if (!theNonce) {
    theNonce = await sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  }
  const ciphertext = sodium.crypto_box_easy(
    key,
    theNonce,
    receiverDeviceEncryptionPublicKey,
    creatorDeviceEncryptionPrivateKey
  );
  return {
    aeadKey: key,
    nonce: theNonce,
    ciphertext,
  };
};
