import sodium from "@serenity-tools/libsodium";

export type Props = {
  receiverDeviceEncryptionPublicKey: string;
  creatorDeviceEncryptionPrivateKey: string;
};
export const createAndEncryptWorkspaceKeyForDevice = ({
  receiverDeviceEncryptionPublicKey,
  creatorDeviceEncryptionPrivateKey,
}: Props) => {
  const workspaceKey = sodium.crypto_kdf_keygen();
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  const ciphertext = sodium.crypto_box_easy(
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
