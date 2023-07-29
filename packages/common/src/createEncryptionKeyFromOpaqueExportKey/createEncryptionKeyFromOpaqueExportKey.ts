import sodium from "react-native-libsodium";

export const createEncryptionKeyFromOpaqueExportKey = (exportKey: string) => {
  const encryptionKey = sodium.crypto_kdf_derive_from_key(
    sodium.crypto_secretbox_KEYBYTES,
    707480540, // hard-coded for the encryption key (locker key)
    "locker",
    sodium.from_base64(exportKey).subarray(0, sodium.crypto_kdf_KEYBYTES)
  );

  return {
    encryptionKey: sodium.to_base64(encryptionKey),
  };
};
