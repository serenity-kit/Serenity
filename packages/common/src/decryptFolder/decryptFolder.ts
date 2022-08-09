import sodium from "@serenity-tools/libsodium";
import { decryptAead, encryptAead } from "@naisho/core";
import canonicalize from "canonicalize";
import { derivedKeyContext } from "../encryptFolder/encryptFolder";

type Params = {
  workspaceKey: string;
  subkeyId: number;
  ciphertext: string;
  publicNonce: string;
};

export const reconstructFolderKey = async (
  workspaceKey: string,
  subkeyId: number
) => {
  const derivedKey = await sodium.crypto_kdf_derive_from_key(
    sodium.crypto_aead_xchacha20poly1305_ietf_KEYBYTES,
    subkeyId,
    derivedKeyContext,
    workspaceKey
  );
  return {
    subkeyId,
    key: derivedKey,
  };
};

export const decryptFolder = async (params: Params) => {
  const folderKey = await reconstructFolderKey(
    params.workspaceKey,
    params.subkeyId
  );
  const result = await decryptAead(
    sodium.from_base64(params.ciphertext),
    canonicalize({}) as string,
    folderKey.key,
    params.publicNonce
  );
  return result;
};
