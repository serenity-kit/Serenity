import canonicalize from "canonicalize";
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
  };
  const canonicalizedPublicData = canonicalize(publicData);
  if (!canonicalizedPublicData) {
    throw new Error("Invalid public data for decrypting the comment.");
  }
  const result = decryptAead(
    sodium.from_base64(ciphertext),
    canonicalizedPublicData,
    sodium.from_base64(key),
    nonce
  );

  return Comment.parse(JSON.parse(sodium.to_string(result)));
};
