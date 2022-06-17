import sodium from "@serenity-tools/libsodium";

export const createEncryptionKeyFromOpaqueExportKey = async (
  exportKey: string,
  encryptionKeySalt?: string
) => {
  let salt = "";
  if (encryptionKeySalt) {
    salt = encryptionKeySalt;
  } else {
    salt = await sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);
  }

  const encryptionKey = await sodium.crypto_pwhash(
    sodium.crypto_secretbox_KEYBYTES,
    exportKey,
    salt,
    sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_ALG_DEFAULT
  );
  return {
    encryptionKey,
    encryptionKeySalt: salt,
  };
};
