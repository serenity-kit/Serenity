import { verifySignature } from "@serenity-tools/secsync";
import sodium from "react-native-libsodium";

type Params = {
  ciphertext: string;
  nonce: string;
  signature: string;
  authorSigningPublicKey: string;
};

export const verifyDocumentNameSignature = ({
  signature,
  nonce,
  ciphertext,
  authorSigningPublicKey,
}: Params) => {
  return verifySignature(
    {
      nonce,
      ciphertext,
    },
    "document_name",
    signature,
    sodium.from_base64(authorSigningPublicKey),
    sodium
  );
};
