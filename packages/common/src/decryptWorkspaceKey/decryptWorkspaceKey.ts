import { idLength } from "@serenity-tools/secsync";
import { extractPrefixFromUint8Array } from "@serenity-tools/secsync/src/utils/extractPrefixFromUint8Array";
import sodium from "react-native-libsodium";
import { domainContextAndVersion } from "../encryptWorkspaceKeyForDevice/encryptWorkspaceKeyForDevice";

type Props = {
  ciphertext: string;
  nonce: string;
  creatorDeviceEncryptionPublicKey: string;
  receiverDeviceEncryptionPrivateKey: string;
  workspaceId: string;
  workspaceKeyId: string;
};
export const decryptWorkspaceKey = ({
  ciphertext,
  nonce,
  creatorDeviceEncryptionPublicKey,
  receiverDeviceEncryptionPrivateKey,
  workspaceKeyId,
  workspaceId,
}: Props) => {
  const value = sodium.crypto_box_open_easy(
    sodium.from_base64(ciphertext),
    sodium.from_base64(nonce),
    sodium.from_base64(creatorDeviceEncryptionPublicKey),
    sodium.from_base64(receiverDeviceEncryptionPrivateKey)
  );
  const { value: valueWithoutDomainContext, prefix: extractedDomainContext } =
    extractPrefixFromUint8Array(value, 1);
  if (extractedDomainContext[0] !== domainContextAndVersion[0]) {
    throw new Error("Invalid workspace key decryption domain context");
  }

  const { value: valueWithoutVersion, prefix: extractedVersion } =
    extractPrefixFromUint8Array(valueWithoutDomainContext, 1);
  if (extractedVersion[0] !== domainContextAndVersion[1]) {
    throw new Error("Invalid workspace key decryption version");
  }

  const { value: valueWithoutWorkspaceId, prefix: extractedWorkspaceId } =
    extractPrefixFromUint8Array(valueWithoutVersion, idLength);
  if (sodium.to_base64(extractedWorkspaceId) !== workspaceId) {
    throw new Error("Invalid workspace key decryption workspaceId");
  }

  const { value: workspaceKey, prefix: extractedWorkspaceKeyId } =
    extractPrefixFromUint8Array(valueWithoutWorkspaceId, idLength);
  if (sodium.to_base64(extractedWorkspaceKeyId) !== workspaceKeyId) {
    throw new Error("Invalid workspace key decryption workspaceKeyId");
  }

  return sodium.to_base64(workspaceKey);
};
