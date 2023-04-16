import sodium from "react-native-libsodium";
import { extractPrefixFromUint8Array } from "./utils/extractPrefixFromUint8Array";
import { prefixWithUint8Array } from "./utils/prefixWithUint8Array";

export function hash(message: string | Uint8Array) {
  return sodium.to_base64(sodium.crypto_generichash(32, message));
}

export function encryptAead(
  message: Uint8Array | string,
  additionalData: string,
  key: Uint8Array
) {
  const publicNonce = sodium.randombytes_buf(
    sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES
  );
  const result = {
    publicNonce: sodium.to_base64(publicNonce),
    ciphertext: sodium.to_base64(
      sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
        // prefixing with a block of null bytes to commit to a single (plaintext, AAD)
        // pair that result in the same (ciphertext, authentication tag) pair
        // see https://soatok.blog/2023/04/03/asymmetric-cryptographic-commitments/#what-is-commitment
        // and https://eprint.iacr.org/2019/016
        prefixWithUint8Array(message, new Uint8Array([0, 0, 0, 0])),
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
  const content = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
    null,
    ciphertext,
    additionalData,
    sodium.from_base64(publicNonce),
    key
  );
  // verify the block of null bytes to commit to a single (plaintext, AAD)
  // pair that result in the same (ciphertext, authentication tag) pair
  // see https://soatok.blog/2023/04/03/asymmetric-cryptographic-commitments/#what-is-commitment
  // and https://eprint.iacr.org/2019/016
  if (
    content[0] !== 0 ||
    content[1] !== 0 ||
    content[2] !== 0 ||
    content[3] !== 0
  ) {
    throw new Error("Invalid ciphertext due null byte block prefix missing");
  }

  const { value } = extractPrefixFromUint8Array(content, 4);
  return value;
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
