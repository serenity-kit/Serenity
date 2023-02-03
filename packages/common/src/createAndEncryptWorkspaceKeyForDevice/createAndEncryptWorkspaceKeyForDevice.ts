import sodium from "react-native-libsodium";

type Props = {
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
    sodium.from_base64(receiverDeviceEncryptionPublicKey),
    sodium.from_base64(creatorDeviceEncryptionPrivateKey)
  );
  return {
    workspaceKey: sodium.to_base64(workspaceKey),
    nonce: sodium.to_base64(nonce),
    ciphertext: sodium.to_base64(ciphertext),
  };
};
