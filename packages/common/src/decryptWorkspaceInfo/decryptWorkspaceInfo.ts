import canonicalize from "canonicalize";
import sodium from "react-native-libsodium";
import { decryptAead } from "../decryptAead/decryptAead";

type Params = {
  key: string;
  ciphertext: string;
  nonce: string;
  publicData?: any;
};

export const decryptWorkspaceInfo = (params: Params) => {
  const publicData = params.publicData || {};
  const canonicalizedPublicData = canonicalize(publicData);
  if (!canonicalizedPublicData) {
    throw new Error("Invalid public data for decrypting the workspace info.");
  }
  const result = decryptAead(
    sodium.from_base64(params.ciphertext),
    canonicalizedPublicData,
    sodium.from_base64(params.key),
    params.nonce
  );
  return JSON.parse(sodium.to_string(result));
};
