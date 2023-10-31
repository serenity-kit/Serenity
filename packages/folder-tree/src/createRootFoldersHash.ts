import { hash } from "@serenity-tools/secsync";
import canonicalize from "canonicalize";
import sodium from "react-native-libsodium";
import { version } from "./constants";

type Params = {
  clock: number;
  rootFolderHashes: string[];
};

export const createRootFoldersHash = (params: Params) => {
  const content = canonicalize({
    clock: params.clock,
    rootFolderHashes: [...params.rootFolderHashes].sort(),
    version,
  });
  if (!content) {
    throw new Error("Could not canonicalize root folders hash content");
  }
  return { version, hash: hash(content, sodium) };
};
