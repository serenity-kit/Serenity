import { encryptAead } from "@naisho/core";
import canonicalize from "canonicalize";
import sodium from "react-native-libsodium";
import { folderDerivedKeyContext } from "../encryptFolderName/encryptFolderName";
import { kdfDeriveFromKey } from "../kdfDeriveFromKey/kdfDeriveFromKey";

type Params = {
  name: string;
  // parentKey is the master key for the workspace or the key of the parent folder
  parentKey: string;
  subkeyId: number;
  publicData?: any;
};

export const encryptExistingFolderName = (params: Params) => {
  const publicData = params.publicData || {};
  const canonicalizedPublicData = canonicalize(publicData);
  if (!canonicalizedPublicData) {
    throw new Error("Invalid public data for encrypting the name.");
  }
  const folderKey = kdfDeriveFromKey({
    key: params.parentKey,
    context: folderDerivedKeyContext,
    subkeyId: params.subkeyId,
  });
  const result = encryptAead(
    params.name,
    canonicalizedPublicData,
    sodium.from_base64(folderKey.key)
  );
  return {
    folderSubkey: folderKey.key,
    folderSubkeyId: folderKey.subkeyId,
    ciphertext: result.ciphertext,
    publicNonce: result.publicNonce,
    publicData,
  };
};
