import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
import { canonicalizeAndToBase64 } from "@serenity-tools/secsync/src/utils/canonicalizeAndToBase64";
import sodium from "react-native-libsodium";
import { decryptAead } from "../decryptAead/decryptAead";
import { verifyCommentSignature } from "../verifyCommentSignature/verifyCommentSignature";
import { Comment } from "../zodTypes";

type Params = {
  key: string;
  ciphertext: string;
  nonce: string;
  documentId: string;
  commentId: string;
  snapshotId: string;
  subkeyId: string;
  signature: string;
  authorSigningPublicKey: string;
  workspaceMemberDevicesProof?: workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProof;
};

export const verifyAndDecryptComment = ({
  signature,
  key,
  nonce,
  ciphertext,
  authorSigningPublicKey,
  commentId,
  documentId,
  snapshotId,
  subkeyId,
  workspaceMemberDevicesProof,
}: Params) => {
  const isValid = verifyCommentSignature({
    authorSigningPublicKey,
    ciphertext,
    nonce,
    signature,
  });
  if (!isValid) {
    throw new Error("Invalid comment signature.");
  }

  const publicData = {
    documentId,
    commentId,
    signingPublicKey: authorSigningPublicKey,
    snapshotId,
    subkeyId,
    workspaceMemberDevicesProof,
  };
  const publicDataAsBase64 = canonicalizeAndToBase64(publicData, sodium);
  const result = decryptAead(
    sodium.from_base64(ciphertext),
    publicDataAsBase64,
    sodium.from_base64(key),
    nonce
  );

  return Comment.parse(JSON.parse(sodium.to_string(result)));
};
