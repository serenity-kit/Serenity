import { encryptAead } from "@naisho/core";
import canonicalize from "canonicalize";
import sodium from "react-native-libsodium";

type Params = {
  title: string;
  key: string;
  publicData?: any;
};

export const encryptDocumentTitle = async (params: Params) => {
  const publicData = params.publicData || {};
  const canonicalizedPublicData = canonicalize(publicData);
  if (!canonicalizedPublicData) {
    throw new Error("Invalid public data for encrypting the title.");
  }
  const result = await encryptAead(
    params.title,
    canonicalizedPublicData,
    sodium.from_base64(params.key)
  );
  return {
    ciphertext: result.ciphertext,
    publicNonce: result.publicNonce,
    publicData,
  };
};
