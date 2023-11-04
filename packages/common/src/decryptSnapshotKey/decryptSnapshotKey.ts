import { idLength } from "@serenity-tools/secsync";
import { extractPrefixFromUint8Array } from "@serenity-tools/secsync/src/utils/extractPrefixFromUint8Array";
import sodium from "react-native-libsodium";
import { snapshotKeyEncryptionDomainContextAndVersion } from "../encryptSnapshotKeyForShareLinkDevice/encryptSnapshotKeyForShareLinkDevice";

type Props = {
  ciphertext: string;
  nonce: string;
  creatorDeviceEncryptionPublicKey: string;
  receiverDeviceEncryptionPrivateKey: string;
  documentId: string;
  snapshotId: string;
};
export const decryptSnapshotKey = ({
  ciphertext,
  nonce,
  creatorDeviceEncryptionPublicKey,
  receiverDeviceEncryptionPrivateKey,
  documentId,
  snapshotId,
}: Props) => {
  const value = sodium.crypto_box_open_easy(
    sodium.from_base64(ciphertext),
    sodium.from_base64(nonce),
    sodium.from_base64(creatorDeviceEncryptionPublicKey),
    sodium.from_base64(receiverDeviceEncryptionPrivateKey)
  );
  const { value: valueWithoutDomainContext, prefix: extractedDomainContext } =
    extractPrefixFromUint8Array(value, 1);
  if (
    extractedDomainContext[0] !==
    snapshotKeyEncryptionDomainContextAndVersion[0]
  ) {
    throw new Error("Invalid snapshot key decryption domain context");
  }

  const { value: valueWithoutVersion, prefix: extractedVersion } =
    extractPrefixFromUint8Array(valueWithoutDomainContext, 1);
  if (extractedVersion[0] !== snapshotKeyEncryptionDomainContextAndVersion[1]) {
    throw new Error("Invalid snapshot key decryption version");
  }

  const { value: valueWithoutDocumentId, prefix: extractedDocumentId } =
    extractPrefixFromUint8Array(valueWithoutVersion, idLength);
  if (sodium.to_base64(extractedDocumentId) !== documentId) {
    throw new Error("Invalid workspace key decryption documentId");
  }

  const { value: snapshotKey, prefix: extractedSnapshotId } =
    extractPrefixFromUint8Array(valueWithoutDocumentId, idLength);
  if (sodium.to_base64(extractedSnapshotId) !== snapshotId) {
    throw new Error("Invalid workspace key decryption snapshotId");
  }

  return sodium.to_base64(snapshotKey);
};
