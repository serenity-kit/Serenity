import { prefixWithUint8Array } from "@serenity-tools/secsync/src/utils/prefixWithUint8Array";
import sodium from "react-native-libsodium";

// first 0 indicating workspace key domain context
// second 0 indicating the workspace key encryption version
export const workspaceKeyEncryptionDomainContextAndVersion = new Uint8Array([
  0, 0,
]);

type Props = {
  receiverDeviceEncryptionPublicKey: string;
  creatorDeviceEncryptionPrivateKey: string;
  workspaceKeyId: string;
  workspaceKey: string;
  workspaceId: string;
  nonce?: string;
};
export const encryptWorkspaceKeyForDevice = ({
  receiverDeviceEncryptionPublicKey,
  creatorDeviceEncryptionPrivateKey,
  workspaceKey,
  nonce,
  workspaceId,
  workspaceKeyId,
}: Props) => {
  let theNonce: Uint8Array;
  if (nonce) {
    theNonce = sodium.from_base64(nonce);
  } else {
    theNonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
  }

  let content = prefixWithUint8Array(
    sodium.from_base64(workspaceKey),
    sodium.from_base64(workspaceKeyId)
  );
  content = prefixWithUint8Array(content, sodium.from_base64(workspaceId));
  content = prefixWithUint8Array(
    content,
    workspaceKeyEncryptionDomainContextAndVersion
  );

  const ciphertext = sodium.crypto_box_easy(
    content,
    theNonce,
    sodium.from_base64(receiverDeviceEncryptionPublicKey),
    sodium.from_base64(creatorDeviceEncryptionPrivateKey)
  );
  return {
    ciphertext: sodium.to_base64(ciphertext),
    nonce: sodium.to_base64(theNonce),
  };
};
