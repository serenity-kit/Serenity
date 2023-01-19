import sodium from "@serenity-tools/libsodium";

export function encryptAead(message, additionalData: string, key: string) {
  // TODO
  // const publicNonce = sodium.randombytes_buf(
  //   sodiumWrappers.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES
  // );
  const publicNonce = sodium.randombytes_buf(24);
  const result = {
    publicNonce,
    ciphertext: sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
      message,
      additionalData,
      null,
      publicNonce,
      key
    ),
  };
  return result;
}

export function decryptAead(
  ciphertext: Uint8Array,
  additionalData: string,
  key: string,
  publicNonce: string
) {
  return sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
    null,
    sodium.to_base64(ciphertext),
    additionalData,
    publicNonce,
    key
  );
}

export function createSignatureKeyPair() {
  const keypair = sodium.crypto_sign_keypair();
  return {
    publicKey: sodium.from_base64(keypair.publicKey),
    privateKey: sodium.from_base64(keypair.privateKey),
    keyType: keypair.keyType,
  };
}

export function sign(message, privateKey) {
  return sodium.crypto_sign_detached(message, privateKey);
}

export function verifySignature(message, signature, publicKey) {
  return sodium.crypto_sign_verify_detached(signature, message, publicKey);
}
