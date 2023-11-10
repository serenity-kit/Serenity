import canonicalize from "canonicalize";
import sodium from "react-native-libsodium";
import { commentDomainContext } from "../encryptAndSignComment/encryptAndSignComment";

type Params = {
  ciphertext: string;
  nonce: string;
  signature: string;
  authorSigningPublicKey: string;
};

export const verifyCommentSignature = ({
  signature,
  nonce,
  ciphertext,
  authorSigningPublicKey,
}: Params) => {
  const canonicalizedEncryptedComment = canonicalize({
    ciphertext,
    nonce,
  });
  if (!canonicalizedEncryptedComment) {
    throw new Error(
      "Invalid encrypted data to canonicalize for verifying a comment."
    );
  }
  return sodium.crypto_sign_verify_detached(
    sodium.from_base64(signature),
    commentDomainContext + canonicalizedEncryptedComment,
    sodium.from_base64(authorSigningPublicKey)
  );
};
