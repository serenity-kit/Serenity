import sodium from "react-native-libsodium";

export function encryptAead(message, additionalData: string, key: Uint8Array) {
  // TODO
  // const publicNonce = sodium.randombytes_buf(
  //   sodiumWrappers.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES
  // );
  const publicNonce = sodium.randombytes_buf(24);
  const result = {
    publicNonce: sodium.to_base64(publicNonce),
    ciphertext: sodium.to_base64(
      sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
        message,
        additionalData,
        null,
        publicNonce,
        key
      )
    ),
  };
  return result;
}

export function decryptAead(
  ciphertext: Uint8Array,
  additionalData: string,
  key: Uint8Array,
  publicNonce: string
) {
  return sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
    null,
    ciphertext,
    additionalData,
    sodium.from_base64(publicNonce),
    key
  );
}

export function createSignatureKeyPair() {
  return sodium.crypto_sign_keypair();
}

export function sign(message: string, privateKey: Uint8Array) {
  return sodium.to_base64(sodium.crypto_sign_detached(message, privateKey));
}

export function verifySignature(
  message,
  signature: string,
  publicKey: Uint8Array
) {
  return sodium.crypto_sign_verify_detached(
    sodium.from_base64(signature),
    message,
    publicKey
  );
}
