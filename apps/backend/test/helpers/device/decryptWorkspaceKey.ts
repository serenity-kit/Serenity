import sodium from "react-native-libsodium";

export type Props = {
  ciphertext: string;
  nonce: string;
  creatorDeviceEncryptionPublicKey: string;
  receiverDeviceEncryptionPrivateKey: string;
};
export const decryptWorkspaceKey = ({
  ciphertext,
  nonce,
  creatorDeviceEncryptionPublicKey,
  receiverDeviceEncryptionPrivateKey,
}: Props) => {
  const workspaceKey = sodium.crypto_box_open_easy(
    sodium.from_base64(ciphertext),
    sodium.from_base64(nonce),
    sodium.from_base64(creatorDeviceEncryptionPublicKey),
    sodium.from_base64(receiverDeviceEncryptionPrivateKey)
  );
  return sodium.to_base64(workspaceKey);
};
