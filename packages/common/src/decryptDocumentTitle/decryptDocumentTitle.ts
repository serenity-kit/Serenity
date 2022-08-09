import sodium from "@serenity-tools/libsodium";
import { decryptAead } from "@naisho/core";
import canonicalize from "canonicalize";

type Params = {
  key: string;
  ciphertext: string;
  publicNonce: string;
  publicData: any;
};

export const decryptDocumentTitle = async (params: Params) => {
  const canonicalizedPublicData = canonicalize(params.publicData);
  if (!canonicalizedPublicData) {
    throw new Error("Invalid public data for decrypting the document.");
  }
  const result = await decryptAead(
    sodium.from_base64(params.ciphertext),
    canonicalizedPublicData,
    params.key,
    params.publicNonce
  );
  return sodium.from_base64_to_string(result);
};
