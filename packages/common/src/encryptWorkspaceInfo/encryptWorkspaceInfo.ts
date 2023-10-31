import canonicalize from "canonicalize";
import sodium from "react-native-libsodium";
import { encryptAead } from "../encryptAead/encryptAead";

type Params = {
  name: string;
  key: string;
  publicData?: any;
};

export const encryptWorkspaceInfo = (params: Params) => {
  const publicData = params.publicData || {};
  const canonicalizedPublicData = canonicalize(publicData);
  if (!canonicalizedPublicData) {
    throw new Error("Invalid public data for encrypting the workspace info.");
  }
  const result = encryptAead(
    JSON.stringify({ name: params.name }),
    canonicalizedPublicData,
    sodium.from_base64(params.key)
  );
  return {
    ciphertext: result.ciphertext,
    nonce: result.publicNonce,
    publicData,
  };
};
