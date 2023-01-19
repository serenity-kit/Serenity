import sodium from "@serenity-tools/libsodium";

export type Props = {
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
  let theNonce = "";
  if (nonce) {
    theNonce = nonce;
  } else {
    theNonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  }
  const ciphertext = sodium.crypto_box_easy(
    workspaceKey,
    theNonce,
    receiverDeviceEncryptionPublicKey,
    creatorDeviceEncryptionPrivateKey
  );
  return {
    ciphertext,
    nonce: theNonce,
  };
};
