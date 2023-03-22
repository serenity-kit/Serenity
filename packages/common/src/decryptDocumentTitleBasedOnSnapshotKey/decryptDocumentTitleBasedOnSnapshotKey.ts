import { decryptAead } from "@naisho/core";
import canonicalize from "canonicalize";
import sodium from "react-native-libsodium";
import { recreateDocumentKey } from "../recreateDocumentKey/recreateDocumentKey";

type Params = {
  snapshotKey: string;
  subkeyId: number;
  ciphertext: string;
  nonce: string;
  publicData?: any;
};

export const decryptDocumentTitleBasedOnSnapshotKey = ({
  snapshotKey,
  subkeyId,
  ciphertext,
  nonce,
  publicData,
}: Params) => {
  const documentKeyData = recreateDocumentKey({
    snapshotKey: snapshotKey,
    subkeyId: subkeyId,
  });

  const canonicalizedPublicData = canonicalize(publicData || {});
  if (!canonicalizedPublicData) {
    throw new Error("Invalid public data for decrypting the document.");
  }
  const result = decryptAead(
    sodium.from_base64(ciphertext),
    canonicalizedPublicData,
    sodium.from_base64(documentKeyData.key),
    nonce
  );
  return sodium.to_string(result);
};
