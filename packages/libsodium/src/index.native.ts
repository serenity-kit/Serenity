import sodium from "react-native-sodium-expo-plugin";
import {
  to_base64,
  from_base64,
  from_base64_to_string,
  base64ToUrlSafeBase64,
  urlSafeBase64ToBase64,
} from "./base64native";
export { to_base64, from_base64, from_base64_to_string } from "./base64native";

export type KeyType = "curve25519" | "ed25519" | "x25519";

export interface KeyPair {
  keyType: KeyType;
  privateKey: Uint8Array;
  publicKey: Uint8Array;
}

export interface StringKeyPair {
  keyType: KeyType;
  privateKey: string;
  publicKey: string;
}

export const ready = Promise.resolve();

export const randombytes_buf = async (length: number): Promise<string> => {
  const result = await sodium.randombytes_buf(length);
  return base64ToUrlSafeBase64(result);
};

export const crypto_sign_keypair = async (): Promise<StringKeyPair> => {
  const result = await sodium.crypto_sign_keypair();
  return {
    keyType: "ed25519",
    privateKey: base64ToUrlSafeBase64(result.sk),
    publicKey: base64ToUrlSafeBase64(result.pk),
  };
};

export const crypto_sign_detached = async (
  message: string,
  privateKey: string
): Promise<string> => {
  const result = await sodium.crypto_sign_detached(
    urlSafeBase64ToBase64(to_base64(message)),
    urlSafeBase64ToBase64(privateKey)
  );
  return base64ToUrlSafeBase64(result);
};

export const crypto_sign_verify_detached = async (
  signature: string,
  message: string,
  privateKey: string
): Promise<boolean> =>
  sodium.crypto_sign_verify_detached(
    urlSafeBase64ToBase64(signature),
    urlSafeBase64ToBase64(to_base64(message)),
    urlSafeBase64ToBase64(privateKey)
  );

export const crypto_aead_xchacha20poly1305_ietf_keygen =
  async (): Promise<string> => {
    const result = await sodium.crypto_aead_xchacha20poly1305_ietf_keygen();
    return base64ToUrlSafeBase64(result);
  };

export const crypto_aead_xchacha20poly1305_ietf_encrypt = async (
  message: string,
  additional_data: string,
  secret_nonce: null,
  public_nonce: string,
  key: string
): Promise<string> => {
  const result = await sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    urlSafeBase64ToBase64(to_base64(message)),
    urlSafeBase64ToBase64(to_base64(additional_data)),
    urlSafeBase64ToBase64(public_nonce),
    urlSafeBase64ToBase64(key)
  );
  return base64ToUrlSafeBase64(result);
};

export const crypto_aead_xchacha20poly1305_ietf_decrypt = async (
  secret_nonce: null,
  ciphertext: string,
  additional_data: string,
  public_nonce: string,
  key: string
): Promise<string> => {
  const result = await sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
    urlSafeBase64ToBase64(ciphertext),
    urlSafeBase64ToBase64(to_base64(additional_data)),
    urlSafeBase64ToBase64(public_nonce),
    urlSafeBase64ToBase64(key)
  );
  return base64ToUrlSafeBase64(result);
};

export default {
  ready,
  to_base64,
  from_base64,
  from_base64_to_string,
  randombytes_buf,
  crypto_sign_keypair,
  crypto_sign_detached,
  crypto_sign_verify_detached,
  crypto_aead_xchacha20poly1305_ietf_keygen,
  crypto_aead_xchacha20poly1305_ietf_encrypt,
  crypto_aead_xchacha20poly1305_ietf_decrypt,
};
