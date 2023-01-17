import sodium from "react-native-libsodium";

export const createEncryptionKeyFromOpaqueExportKey = (
  exportKey: string,
  encryptionKeySalt?: string
) => {
  let salt = "";
  if (encryptionKeySalt) {
    salt = encryptionKeySalt;
  } else {
    salt = sodium.to_base64(
      sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES)
    );
  }

  const encryptionKey = sodium.crypto_pwhash(
    sodium.crypto_secretbox_KEYBYTES,
    exportKey,
    sodium.from_base64(salt),
    sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_ALG_DEFAULT
  );
  return {
    encryptionKey: sodium.to_base64(encryptionKey),
    encryptionKeySalt: salt,
  };
};
