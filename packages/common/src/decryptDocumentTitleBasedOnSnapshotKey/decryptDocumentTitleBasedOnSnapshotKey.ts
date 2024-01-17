import { canonicalizeAndToBase64 } from "@serenity-tools/secsync/src/utils/canonicalizeAndToBase64";
import sodium from "react-native-libsodium";
import { decryptAead } from "../decryptAead/decryptAead";
import { recreateDocumentTitleKey } from "../recreateDocumentTitleKey/recreateDocumentTitleKey";

type Params = {
  snapshotKey: string;
  subkeyId: string;
  ciphertext: string;
  nonce: string;
};

export const decryptDocumentTitleBasedOnSnapshotKey = ({
  snapshotKey,
  subkeyId,
  ciphertext,
  nonce,
}: Params) => {
  const documentTitleKeyData = recreateDocumentTitleKey({
    snapshotKey: snapshotKey,
    subkeyId: subkeyId,
  });

  const publicDataAsBase64 = canonicalizeAndToBase64({}, sodium);
  const result = decryptAead(
    sodium.from_base64(ciphertext),
    publicDataAsBase64,
    sodium.from_base64(documentTitleKeyData.key),
    nonce
  );
  return sodium.to_string(result);
};
