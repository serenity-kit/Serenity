import sodium from "react-native-libsodium";

type Props = {
  receiverDeviceEncryptionPublicKey: string;
  creatorDeviceEncryptionPrivateKey: string;
  workspaceKey: string;
  nonce?: string;
};
export const encryptWorkspaceKeyForDevice = ({
  receiverDeviceEncryptionPublicKey,
  creatorDeviceEncryptionPrivateKey,
  workspaceKey,
  nonce,
}: Props) => {
  let theNonce: Uint8Array;
  if (nonce) {
    theNonce = sodium.from_base64(nonce);
  } else {
    theNonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
  }
  const ciphertext = sodium.crypto_box_easy(
    sodium.from_base64(workspaceKey),
    theNonce,
    sodium.from_base64(receiverDeviceEncryptionPublicKey),
    sodium.from_base64(creatorDeviceEncryptionPrivateKey)
  );
  return {
    ciphertext: sodium.to_base64(ciphertext),
    nonce: sodium.to_base64(theNonce),
  };
};
