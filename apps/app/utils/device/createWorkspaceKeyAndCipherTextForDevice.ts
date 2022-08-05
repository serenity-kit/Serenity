import sodium from "@serenity-tools/libsodium";

export type Props = {
  receiverDeviceEncryptionPublicKey: string;
  creatorDeviceEncryptionPrivateKey: string;
  workspaceKey?: string;
  nonce?: string;
};
export const createWorkspaceKeyAndCipherTextForDevice = async ({
  receiverDeviceEncryptionPublicKey,
  creatorDeviceEncryptionPrivateKey,
  workspaceKey,
  nonce,
}: Props) => {
  let key = workspaceKey;
  if (!key) {
    key = await sodium.crypto_kdf_keygen();
  }
  let theNonce = nonce;
  if (!theNonce) {
    theNonce = await sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  }
  const ciphertext = await sodium.crypto_box_easy(
    key,
    theNonce,
    receiverDeviceEncryptionPublicKey,
    creatorDeviceEncryptionPrivateKey
  );
  return {
    workspaceKey: key,
    nonce: theNonce,
    ciphertext,
  };
};
