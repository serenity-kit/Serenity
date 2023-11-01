import { hash } from "@serenity-tools/secsync";
import canonicalize from "canonicalize";
import sodium from "react-native-libsodium";
import { version } from "./constants";

type Params = {
  documentId: string;
  documentChainEventHash: string;
};

export const createDocumentHash = (params: Params) => {
  const content = canonicalize({ ...params, version });
  if (!content) {
    throw new Error("Could not canonicalize folder hash content");
  }
  return { version, hash: hash(content, sodium) };
};
