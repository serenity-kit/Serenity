import canonicalize from "canonicalize";
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
  const canonicalizedPublicData = canonicalize(publicData);
  if (!canonicalizedPublicData) {
    throw new Error("Invalid public data for encrypting a comment.");
  }
  const encryptedComment = encryptAead(
    content,
    canonicalizedPublicData,
    sodium.from_base64(key)
  );
  const canonicalizedEncryptedComment = canonicalize({
    ciphertext: encryptedComment.ciphertext,
    nonce: encryptedComment.publicNonce,
  });
  if (!canonicalizedPublicData) {
    throw new Error("Invalid encrypted data to canonicalize.");
  }
  const signature = sodium.to_base64(
    sodium.crypto_sign_detached(
      commentDomainContext + canonicalizedEncryptedComment,
      sodium.from_base64(device.signingPrivateKey)
    )
  );

  return {
    commentId,
    ciphertext: encryptedComment.ciphertext,
    nonce: encryptedComment.publicNonce,
    signature,
  };
};
