import sodium from "@serenity-tools/libsodium";
import { decryptAead } from "@naisho/core";
import canonicalize from "canonicalize";

type Params = {
  key: string;
  ciphertext: string;
  publicNonce: string;
};

export const decryptDocumentTitle = async (params: Params) => {
  const result = await decryptAead(
    sodium.from_base64(params.ciphertext),
    canonicalize({}) as string,
    params.key,
    params.publicNonce
  );
  return sodium.from_base64_to_string(result);
};
