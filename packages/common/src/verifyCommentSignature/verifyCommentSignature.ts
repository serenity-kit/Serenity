import { verifySignature } from "@serenity-tools/secsync";
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
  return verifySignature(
    { ciphertext, nonce },
    commentDomainContext,
    signature,
    sodium.from_base64(authorSigningPublicKey),
    sodium
  );
};
