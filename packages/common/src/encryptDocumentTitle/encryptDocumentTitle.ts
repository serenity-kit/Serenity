import { encryptAead } from "@naisho/core";
import canonicalize from "canonicalize";

type Params = {
  title: string;
  key: string;
};

export const encryptDocumentTitle = async (params: Params) => {
  const result = await encryptAead(
    params.title,
    canonicalize({}) as string,
    params.key
  );
  return {
    ciphertext: result.ciphertext,
    publicNonce: result.publicNonce,
  };
};
