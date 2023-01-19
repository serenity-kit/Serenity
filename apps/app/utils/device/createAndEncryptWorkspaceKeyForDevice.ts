import sodium from "@serenity-tools/libsodium";

export type Props = {
  receiverDeviceEncryptionPublicKey: string;
  creatorDeviceEncryptionPrivateKey: string;
  workspaceKey: string;
};
export const createAndEncryptWorkspaceKeyForDevice = ({
  receiverDeviceEncryptionPublicKey,
  creatorDeviceEncryptionPrivateKey,
  workspaceKey,
}: Props) => {
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  const ciphertext = sodium.crypto_box_easy(
    workspaceKey,
    nonce,
    receiverDeviceEncryptionPublicKey,
    creatorDeviceEncryptionPrivateKey
  );
  return {
    nonce,
    ciphertext,
  };
};
