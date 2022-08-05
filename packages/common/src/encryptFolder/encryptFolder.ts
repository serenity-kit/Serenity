import sodium from "@serenity-tools/libsodium";
import { encryptAead } from "@naisho/core";
import canonicalize from "canonicalize";

type Params = {
  name: string;
  workspaceKey: string;
};

// TODO figure out how generate a random subkeyId for the full space
// ideally we could leverage the full 2 ** 64 - 1 space, but it's not possible in JavaScript
// While 2 ** 32 - 1 should be a valid uint32_t it failed
const upperBound = 2 ** 31 - 1;

export const derivedKeyContext = "serenity";

const createFolderKey = async (workspaceKey: string) => {
  // TODO On the frontend and on the backend we should check no
  // subkeyId per workspaceKey is a duplicate.
  const subkeyId = await sodium.randombytes_uniform(upperBound);
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

export const encryptFolder = async (params: Params) => {
  const folderKey = await createFolderKey(params.workspaceKey);
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
