import sodium from "react-native-sodium-expo-plugin";
import { to_base64, from_base64, from_base64_to_string } from "./base64native";
import {
  base64ToUrlSafeBase64,
  urlSafeBase64ToBase64,
} from "./base64Conversion";
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

export const randombytes_uniform = async (
  upperBound: number
): Promise<number> => {
  const result = await sodium.randombytes_uniform(upperBound);
  return result;
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
  publicKey: string
): Promise<boolean> => {
  const result = (await sodium.crypto_sign_verify_detached(
    urlSafeBase64ToBase64(signature),
    urlSafeBase64ToBase64(to_base64(message)),
    urlSafeBase64ToBase64(publicKey)
  )) as unknown as number;
  return result === 1;
};

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

export const crypto_box_keypair = async (): Promise<StringKeyPair> => {
  const result = await sodium.crypto_box_keypair();
  return {
    keyType: "curve25519",
    privateKey: urlSafeBase64ToBase64(result.sk),
    publicKey: urlSafeBase64ToBase64(result.pk),
  };
};

export const crypto_pwhash = async (
  keyLength: number,
  password: string,
  salt: string,
  opsLimit: number,
  memLimit: number,
  algorithm: number
): Promise<string> => {
  const result = await sodium.crypto_pwhash(
    keyLength,
    urlSafeBase64ToBase64(to_base64(password)),
    urlSafeBase64ToBase64(salt),
    opsLimit,
    memLimit,
    algorithm
  );
  return base64ToUrlSafeBase64(result);
};

export const crypto_secretbox_easy = async (
  message: string,
  nonce: string,
  key: string
): Promise<string> => {
  const result = await sodium.crypto_secretbox_easy(
    urlSafeBase64ToBase64(message),
    urlSafeBase64ToBase64(nonce),
    urlSafeBase64ToBase64(key)
  );
  return base64ToUrlSafeBase64(result);
};

export const crypto_secretbox_open_easy = async (
  ciphertext: string,
  nonce: string,
  key: string
): Promise<string> => {
  const result = await sodium.crypto_secretbox_open_easy(
    urlSafeBase64ToBase64(ciphertext),
    urlSafeBase64ToBase64(nonce),
    urlSafeBase64ToBase64(key)
  );
  return base64ToUrlSafeBase64(result);
};

export const crypto_box_seal = async (
  message: string,
  recipientPublicKey: string
): Promise<string> => {
  const result = await sodium.crypto_box_seal(
    urlSafeBase64ToBase64(message),
    urlSafeBase64ToBase64(recipientPublicKey)
  );
  return base64ToUrlSafeBase64(result);
};

export const crypto_box_seal_open = async (
  ciphertext: string,
  recipientPublicKey: string,
  recipientPrivateKey: string
): Promise<string> => {
  const result = await sodium.crypto_box_seal_open(
    urlSafeBase64ToBase64(ciphertext),
    urlSafeBase64ToBase64(recipientPublicKey),
    urlSafeBase64ToBase64(recipientPrivateKey)
  );
  return base64ToUrlSafeBase64(result);
};

export const crypto_kdf_keygen = async (): Promise<string> => {
  throw new Error("Not implemented");
};

export const crypto_kdf_derive_from_key = async (
  subkey_len: number,
  nonce: number,
  context: string,
  key: string
): Promise<string> => {
  if ([...context].length !== 8) {
    throw new Error("crypto_kdf_derive_from_key context must be 8 bytes");
  }
  throw new Error("Not implemented");
};

export default {
  ready,
  to_base64,
  from_base64,
  from_base64_to_string,
  randombytes_buf,
  randombytes_uniform,
  crypto_pwhash,
  crypto_box_keypair,
  crypto_sign_keypair,
  crypto_sign_detached,
  crypto_sign_verify_detached,
  crypto_secretbox_easy,
  crypto_secretbox_open_easy,
  crypto_aead_xchacha20poly1305_ietf_keygen,
  crypto_aead_xchacha20poly1305_ietf_encrypt,
  crypto_aead_xchacha20poly1305_ietf_decrypt,
  crypto_kdf_keygen,
  crypto_kdf_derive_from_key,
  crypto_secretbox_NONCEBYTES: sodium.crypto_secretbox_NONCEBYTES,
  crypto_secretbox_KEYBYTES: sodium.crypto_secretbox_KEYBYTES,
  crypto_pwhash_SALTBYTES: sodium.crypto_pwhash_SALTBYTES,
  crypto_pwhash_ALG_DEFAULT: sodium.crypto_pwhash_ALG_DEFAULT,
  crypto_pwhash_OPSLIMIT_INTERACTIVE: 2, // copied from the web version
  crypto_pwhash_MEMLIMIT_INTERACTIVE: 67108864, // copied from the web version
  crypto_box_PUBLICKEYBYTES: sodium.crypto_box_PUBLICKEYBYTES,
  crypto_box_SECRETKEYBYTES: sodium.crypto_box_SECRETKEYBYTES,
  crypto_aead_xchacha20poly1305_ietf_KEYBYTES: 32, // copied from the web version
  base64_to_url_safe_base64: base64ToUrlSafeBase64,
  url_safe_base64_to_base64: urlSafeBase64ToBase64,
};
