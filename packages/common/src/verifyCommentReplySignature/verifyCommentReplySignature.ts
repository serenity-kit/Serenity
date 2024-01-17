import { verifySignature } from "@serenity-tools/secsync";
import sodium from "react-native-libsodium";
import { commentReplyDomainContext } from "../encryptAndSignCommentReply/encryptAndSignCommentReply";

type Params = {
  ciphertext: string;
  nonce: string;
  signature: string;
  authorSigningPublicKey: string;
};

export const verifyCommentReplySignature = ({
  signature,
  nonce,
  ciphertext,
  authorSigningPublicKey,
}: Params) => {
  return verifySignature(
    { ciphertext, nonce },
    commentReplyDomainContext,
    signature,
    sodium.from_base64(authorSigningPublicKey),
    sodium
  );
};
