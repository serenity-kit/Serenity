import sodium from "react-native-libsodium";

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
    sodium.from_base64(workspaceKey),
    nonce,
    sodium.from_base64(receiverDeviceEncryptionPublicKey),
    sodium.from_base64(creatorDeviceEncryptionPrivateKey)
  );
  return {
    nonce: sodium.to_base64(nonce),
    ciphertext: sodium.to_base64(ciphertext),
  };
};
