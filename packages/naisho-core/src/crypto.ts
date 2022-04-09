import sodiumWrappers from "libsodium-wrappers";
import sodium from "@serenity-tools/libsodium";

export function encryptAead(message, additionalData: string, key: Uint8Array) {
  const secretNonce = sodiumWrappers.randombytes_buf(
    sodiumWrappers.crypto_aead_xchacha20poly1305_ietf_NSECBYTES
  );
  const publicNonce = sodiumWrappers.randombytes_buf(
    sodiumWrappers.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES
  );
  return {
    publicNonce,
    ciphertext: sodiumWrappers.crypto_aead_xchacha20poly1305_ietf_encrypt(
      message,
      additionalData,
      secretNonce,
      publicNonce,
      key
    ),
  };
}

export function decryptAead(
  ciphertext,
  additionalData: string,
  key: Uint8Array,
  publicNonce: Uint8Array
) {
  if (
    ciphertext.length < sodiumWrappers.crypto_aead_xchacha20poly1305_ietf_ABYTES
  ) {
    throw "The ciphertext was too short";
  }

  return sodiumWrappers.crypto_aead_xchacha20poly1305_ietf_decrypt(
    new Uint8Array(0),
    ciphertext,
    additionalData,
    publicNonce,
    key
  );
}

export async function createSignatureKeyPair() {
  const keypair = await sodium.crypto_sign_keypair();
  return {
    publicKey: sodium.from_base64(keypair.publicKey),
    privateKey: sodium.from_base64(keypair.privateKey),
    keyType: keypair.keyType,
  };
}

export function sign(message, privateKey) {
  return sodiumWrappers.crypto_sign_detached(message, privateKey);
}

export function verifySignature(message, signature, publicKey) {
  return sodiumWrappers.crypto_sign_verify_detached(
    signature,
    message,
    publicKey
  );
}
