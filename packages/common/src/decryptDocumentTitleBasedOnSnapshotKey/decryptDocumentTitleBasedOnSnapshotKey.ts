import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
import { canonicalizeAndToBase64 } from "@serenity-tools/secsync/src/utils/canonicalizeAndToBase64";
import sodium from "react-native-libsodium";
import { decryptAead } from "../decryptAead/decryptAead";
import { recreateDocumentTitleKey } from "../recreateDocumentTitleKey/recreateDocumentTitleKey";
import { verifyDocumentNameSignature } from "../verifyDocumentNameSignature/verifyDocumentNameSignature";

type Params = {
  snapshotKey: string;
  subkeyId: string;
  ciphertext: string;
  nonce: string;
  workspaceId: string;
  documentId: string;
  workspaceMemberDevicesProof: workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProof;
  signature: string;
  creatorDeviceSigningPublicKey: string;
};

export const decryptDocumentTitleBasedOnSnapshotKey = ({
  snapshotKey,
  subkeyId,
  ciphertext,
  nonce,
  workspaceId,
  documentId,
  workspaceMemberDevicesProof,
  signature,
  creatorDeviceSigningPublicKey,
}: Params) => {
  const isValidDocumentNameSignature = verifyDocumentNameSignature({
    authorSigningPublicKey: creatorDeviceSigningPublicKey,
    ciphertext,
    nonce,
    signature,
  });
  if (!isValidDocumentNameSignature) {
    throw new Error(
      "Invalid document name signature on createInitialWorkspaceStructure"
    );
  }

  const documentTitleKeyData = recreateDocumentTitleKey({
    snapshotKey: snapshotKey,
    subkeyId: subkeyId,
  });

  const publicDataAsBase64 = canonicalizeAndToBase64(
    {
      workspaceId,
      documentId,
      workspaceMemberDevicesProof,
    },
    sodium
  );
  const result = decryptAead(
    sodium.from_base64(ciphertext),
    publicDataAsBase64,
    sodium.from_base64(documentTitleKeyData.key),
    nonce
  );
  return sodium.to_string(result);
};
