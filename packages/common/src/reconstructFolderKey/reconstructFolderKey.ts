import sodium from "@serenity-tools/libsodium";
import { derivedKeyContext } from "../createFolderKey/createFolderKey";

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
