import { decryptAead } from "@naisho/core";
import sodium from "@serenity-tools/libsodium";
import canonicalize from "canonicalize";
import { folderDerivedKeyContext } from "../encryptFolder/encryptFolder";
import { kdfDeriveFromKey } from "../kdfDeriveFromKey/kdfDeriveFromKey";

type Params = {
  // parentKey is the master key for the workspace or the key of the parent folder
  parentKey: string;
  subkeyId: number;
  ciphertext: string;
  publicNonce: string;
  publicData?: any;
};

export const decryptFolder = async (params: Params) => {
  const publicData = params.publicData || {};
  const canonicalizedPublicData = canonicalize(publicData);
  if (!canonicalizedPublicData) {
    throw new Error("Invalid public data for decrypting the folder.");
  }
  const folderKey = await kdfDeriveFromKey({
    key: params.parentKey,
    context: folderDerivedKeyContext,
    subkeyId: params.subkeyId,
  });
  const result = await decryptAead(
    sodium.from_base64(params.ciphertext),
    canonicalizedPublicData,
    folderKey.key,
    params.publicNonce
  );
  return sodium.from_base64_to_string(result);
};
