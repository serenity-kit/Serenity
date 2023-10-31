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
};

export const createFolderHash = (params: Params) => {
  const content = canonicalize({
    ...params,
    subFolderHashes: [...params.subFolderHashes].sort(),
    subDocumentHashes: [...params.subDocumentHashes].sort(),
    version,
  });
  if (!content) {
    throw new Error("Could not canonicalize folder hash content");
  }
  return { version, hash: hash(content, sodium) };
};
