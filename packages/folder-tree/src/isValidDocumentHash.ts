import { hash } from "@serenity-tools/secsync";
import canonicalize from "canonicalize";
import sodium from "react-native-libsodium";
import { version } from "./constants";

type Params = {
  documentId: string;
  documentChainEventHash: string;
  hash: string;
  version: number;
};

export const isValidDocumentHash = (params: Params) => {
  if (params.version > version) {
    throw new Error("Newer version detected. Please update your app.");
  }
  const content = canonicalize({
    documentId: params.documentId,
    documentChainEventHash: params.documentChainEventHash,
    version: params.version,
  });
  if (!content) {
    throw new Error("Could not canonicalize folder hash content");
  }
  return params.hash === hash(content, sodium);
};
