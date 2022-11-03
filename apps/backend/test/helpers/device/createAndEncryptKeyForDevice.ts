import sodium from "@serenity-tools/libsodium";

export type Props = {
  receiverDeviceEncryptionPublicKey: string;
  creatorDeviceEncryptionPrivateKey: string;
};
export const createAndEncryptKeyForDevice = async ({
  receiverDeviceEncryptionPublicKey,
  creatorDeviceEncryptionPrivateKey,
}: Props) => {
  const workspaceKey = await sodium.crypto_kdf_keygen();
  const nonce = await sodium.randombytes_buf(
    sodium.crypto_secretbox_NONCEBYTES
  );
  const ciphertext = await sodium.crypto_box_easy(
    workspaceKey,
    nonce,
    receiverDeviceEncryptionPublicKey,
    creatorDeviceEncryptionPrivateKey
  );
  return {
    workspaceKey,
    nonce,
    ciphertext,
  };
};
