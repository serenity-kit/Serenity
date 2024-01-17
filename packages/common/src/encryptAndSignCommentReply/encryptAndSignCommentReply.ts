import { sign } from "@serenity-tools/secsync";
import { canonicalizeAndToBase64 } from "@serenity-tools/secsync/src/utils/canonicalizeAndToBase64";
import sodium from "react-native-libsodium";
import { encryptAead } from "../encryptAead/encryptAead";
import { generateId } from "../generateId/generateId";
import { LocalDevice } from "../types";

type Params = {
  text: string;
  commentId: string;
  key: string;
  documentId: string;
  snapshotId: string;
  subkeyId: string;
  device: LocalDevice;
};

export const commentReplyDomainContext = "comment_reply";

export const encryptAndSignCommentReply = ({
  text,
  key,
  commentId,
  documentId,
  snapshotId,
  subkeyId,
  device,
}: Params) => {
  const commentReplyId = generateId();
  const content = JSON.stringify({
    text,
  });

  const publicData = {
    commentReplyId,
    commentId,
    documentId,
    snapshotId,
    subkeyId,
    signingPublicKey: device.signingPublicKey,
  };
  const publicDataAsBase64 = canonicalizeAndToBase64(publicData, sodium);
  const encryptedComment = encryptAead(
    content,
    publicDataAsBase64,
    sodium.from_base64(key)
  );
  const signature = sign(
    {
      ciphertext: encryptedComment.ciphertext,
      nonce: encryptedComment.publicNonce,
    },
    commentReplyDomainContext,
    sodium.from_base64(device.signingPrivateKey),
    sodium
  );

  return {
    commentReplyId,
    ciphertext: encryptedComment.ciphertext,
    nonce: encryptedComment.publicNonce,
    signature,
  };
};
