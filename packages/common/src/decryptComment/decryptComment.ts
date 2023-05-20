import canonicalize from "canonicalize";
import sodium from "react-native-libsodium";
import { decryptAead } from "../decryptAead/decryptAead";

type Params = {
  key: string;
  ciphertext: string;
  publicNonce: string;
  publicData?: any;
};

export const decryptComment = (params: Params) => {
  const publicData = params.publicData || {};
  const canonicalizedPublicData = canonicalize(publicData);
  if (!canonicalizedPublicData) {
    throw new Error("Invalid public data for decrypting the document.");
  }
  const result = decryptAead(
    sodium.from_base64(params.ciphertext),
    canonicalizedPublicData,
    sodium.from_base64(params.key),
    params.publicNonce
  );
  return sodium.to_string(result);
};
