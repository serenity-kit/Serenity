import { sign } from "@serenity-tools/secsync";
import { canonicalizeAndToBase64 } from "@serenity-tools/secsync/src/utils/canonicalizeAndToBase64";
import sodium from "react-native-libsodium";
import { encryptAead } from "../encryptAead/encryptAead";
import { generateId } from "../generateId/generateId";
import { LocalDevice } from "../types";

type Params = {
  text: string;
  from: any;
  to: any;
  key: string;
  documentId: string;
  snapshotId: string;
  subkeyId: string;
  device: LocalDevice;
};

export const commentDomainContext = "comment";

export const encryptAndSignComment = ({
  text,
  from,
  to,
  key,
  documentId,
  snapshotId,
  subkeyId,
  device,
}: Params) => {
  const commentId = generateId();
  const content = JSON.stringify({
    text,
    from,
    to,
  });

  const publicData = {
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
    commentDomainContext,
    sodium.from_base64(device.signingPrivateKey),
    sodium
  );

  return {
    commentId,
    ciphertext: encryptedComment.ciphertext,
    nonce: encryptedComment.publicNonce,
    signature,
  };
};
