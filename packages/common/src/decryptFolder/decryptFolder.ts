import sodium from "@serenity-tools/libsodium";
import { decryptAead } from "@naisho/core";
import canonicalize from "canonicalize";
import { derivedKeyContext } from "../encryptFolder/encryptFolder";
import { kdfDeriveFromKey } from "../kdfDeriveFromKey/kdfDeriveFromKey";

type Params = {
  // parentKey is the master key for the workspace or the key of the parent folder
  parentKey: string;
  subkeyId: number;
  ciphertext: string;
  publicNonce: string;
  publicData: any;
};

export const decryptFolder = async (params: Params) => {
  const canonicalizedPublicData = canonicalize(params.publicData);
  if (!canonicalizedPublicData) {
    throw new Error("Invalid public data for decrypting the folder.");
  }
  const folderKey = await kdfDeriveFromKey({
    key: params.parentKey,
    context: derivedKeyContext,
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
