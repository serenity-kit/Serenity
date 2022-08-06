import { encryptAead } from "@naisho/core";
import canonicalize from "canonicalize";
import { kdfDeriveFromKey } from "../kdfDeriveFromKey/kdfDeriveFromKey";

type Params = {
  name: string;
  // parentKey is the master key for the workspace or the key of the parent folder
  parentKey: string;
};

// Having a specific "folder__" context allows us to use have the same subKeyId
// for one parentKey and checking only the uniquness for this type.
export const derivedKeyContext = "folder__";

export const encryptFolder = async (params: Params) => {
  // TODO On the frontend and on the backend we should check no
  // subkeyId per parentKey is a duplicate.
  const folderKey = await kdfDeriveFromKey({
    key: params.parentKey,
    context: derivedKeyContext,
  });
  const result = await encryptAead(
    params.name,
    canonicalize({}) as string,
    folderKey.key
  );
  return {
    folderSubKey: folderKey.key,
    folderSubkeyId: folderKey.subkeyId,
    ciphertext: result.ciphertext,
    publicNonce: result.publicNonce,
  };
};
