import sodium from "@serenity-tools/libsodium";

export type Props = {
  ciphertext: string;
  nonce: string;
  creatorDeviceEncryptionPublicKey: string;
  receiverDeviceEncryptionPrivateKey: string;
};
export const decryptWorkspaceKey = async ({
  ciphertext,
  nonce,
  creatorDeviceEncryptionPublicKey,
  receiverDeviceEncryptionPrivateKey,
}: Props) => {
  const workspaceKey = await sodium.crypto_box_open_easy(
    ciphertext,
    nonce,
    creatorDeviceEncryptionPublicKey,
    receiverDeviceEncryptionPrivateKey
  );
  return workspaceKey;
};
