import { hash } from "@serenity-tools/secsync";
import canonicalize from "canonicalize";
import sodium from "react-native-libsodium";
import { version } from "./constants";

type Params = {
  folderId: string;
  nameCiphertext: string;
  nameNonce: string;
  clock: number;
  subFolderHashes: string[];
  subDocumentHashes: string[];
  version: number;
  hash: string;
};

export const isValidFolderHash = (params: Params) => {
  if (params.version > version) {
    throw new Error("Newer version detected. Please update your app.");
  }
  const { hash: hashValue, ...rest } = params;
  const content = canonicalize({
    ...rest,
    subFolderHashes: [...rest.subFolderHashes].sort(),
    subDocumentHashes: [...rest.subDocumentHashes].sort(),
  });
  if (!content) {
    throw new Error("Could not canonicalize folder hash content");
  }
  return hashValue === hash(content, sodium);
};
