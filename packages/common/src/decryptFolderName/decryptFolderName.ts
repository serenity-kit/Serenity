import { decryptAead } from "@naisho/core";
import canonicalize from "canonicalize";
import sodium from "react-native-libsodium";
import { folderDerivedKeyContext } from "../encryptFolderName/encryptFolderName";
import { kdfDeriveFromKey } from "../kdfDeriveFromKey/kdfDeriveFromKey";

type Params = {
  // parentKey is the master key for the workspace or the key of the parent folder
  parentKey: string;
  subkeyId: number;
  ciphertext: string;
  publicNonce: string;
  publicData?: any;
};

export const decryptFolderName = async (params: Params) => {
  const publicData = params.publicData || {};
  const canonicalizedPublicData = canonicalize(publicData);
  if (!canonicalizedPublicData) {
    throw new Error("Invalid public data for decrypting the folder.");
  }
  const folderKey = kdfDeriveFromKey({
    key: params.parentKey,
    context: folderDerivedKeyContext,
    subkeyId: params.subkeyId,
  });
  const result = await decryptAead(
    sodium.from_base64(params.ciphertext),
    canonicalizedPublicData,
    sodium.from_base64(folderKey.key),
    params.publicNonce
  );
  return sodium.to_string(result);
};
