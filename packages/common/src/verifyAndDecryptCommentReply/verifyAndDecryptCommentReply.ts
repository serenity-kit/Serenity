import { canonicalizeAndToBase64 } from "@serenity-tools/secsync/src/utils/canonicalizeAndToBase64";
import sodium from "react-native-libsodium";
import { decryptAead } from "../decryptAead/decryptAead";
import { verifyCommentReplySignature } from "../verifyCommentReplySignature/verifyCommentReplySignature";

type Params = {
  key: string;
  ciphertext: string;
  nonce: string;
  documentId: string;
  commentReplyId: string;
  commentId: string;
  snapshotId: string;
  signature: string;
  authorSigningPublicKey: string;
  subkeyId: string;
};

export const verifyAndDecryptCommentReply = ({
  signature,
  key,
  nonce,
  ciphertext,
  commentReplyId,
  commentId,
  authorSigningPublicKey,
  documentId,
  snapshotId,
  subkeyId,
}: Params) => {
  const isValid = verifyCommentReplySignature({
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
    commentReplyId,
    signingPublicKey: authorSigningPublicKey,
    snapshotId,
    subkeyId,
  };
  const publicDataAsBase64 = canonicalizeAndToBase64(publicData, sodium);
  const result = decryptAead(
    sodium.from_base64(ciphertext),
    publicDataAsBase64,
    sodium.from_base64(key),
    nonce
  );
  return JSON.parse(sodium.to_string(result));
};
