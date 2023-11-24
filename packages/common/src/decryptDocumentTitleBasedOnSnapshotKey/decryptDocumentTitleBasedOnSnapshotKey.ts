import canonicalize from "canonicalize";
import sodium from "react-native-libsodium";
import { decryptAead } from "../decryptAead/decryptAead";
import { recreateDocumentTitleKey } from "../recreateDocumentTitleKey/recreateDocumentTitleKey";

type Params = {
  snapshotKey: string;
  subkeyId: string;
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
  const documentTitleKeyData = recreateDocumentTitleKey({
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
    sodium.from_base64(documentTitleKeyData.key),
    nonce
  );
  return sodium.to_string(result);
};
