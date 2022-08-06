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
};

export const decryptFolder = async (params: Params) => {
  const folderKey = await kdfDeriveFromKey({
    key: params.parentKey,
    context: derivedKeyContext,
    subkeyId: params.subkeyId,
  });

  const result = await decryptAead(
    sodium.from_base64(params.ciphertext),
    canonicalize({}) as string,
    folderKey.key,
    params.publicNonce
  );
  return sodium.from_base64_to_string(result);
};
