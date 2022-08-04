import sodium from "@serenity-tools/libsodium";

// TODO figure out how generate a random subkeyId for the full space
// ideally we could leverage the full 2 ** 64 - 1 space, but it's not possible in JavaScript
// While 2 ** 32 - 1 should be a valid uint32_t it failed
const upperBound = 2 ** 31 - 1;

export const derivedKeyContext = "serenity";

export const createFolderKey = async (workspaceKey: string) => {
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
