import sodium, { StringKeyPair } from "libsodium-wrappers";
import {
  base64ToUrlSafeBase64,
  urlSafeBase64ToBase64,
} from "./base64Conversion";
import { from_base64, from_base64_to_string, to_base64 } from "./base64wasm";
export type { KeyPair, KeyType, StringKeyPair } from "libsodium-wrappers";
export { from_base64, from_base64_to_string, to_base64 } from "./base64wasm";
export const ready = sodium.ready;

export const randombytes_buf = async (length: number): Promise<string> => {
  const result = await sodium.randombytes_buf(length);
  return to_base64(result);
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
    privateKey: to_base64(result.privateKey),
    publicKey: to_base64(result.publicKey),
  };
};

export const crypto_sign_detached = async (
  message: string,
  privateKey: string
): Promise<string> => {
  const result = await sodium.crypto_sign_detached(
    message,
    from_base64(privateKey)
  );
  return to_base64(result);
};

export const crypto_sign_verify_detached = async (
  signature: string,
  message: string,
  publicKey: string
): Promise<boolean> => {
  return await sodium.crypto_sign_verify_detached(
    from_base64(signature),
    message,
    from_base64(publicKey)
  );
};

export const crypto_aead_xchacha20poly1305_ietf_keygen =
  async (): Promise<string> =>
    to_base64(sodium.crypto_aead_xchacha20poly1305_ietf_keygen());

export const crypto_aead_xchacha20poly1305_ietf_encrypt = async (
  message: string,
  additional_data: string,
  secret_nonce: null,
  public_nonce: string,
  key: string
): Promise<string> => {
  const result = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    message,
    additional_data,
    secret_nonce,
    from_base64(public_nonce),
    from_base64(key)
  );
  return to_base64(result);
};

export const crypto_aead_xchacha20poly1305_ietf_decrypt = async (
  secret_nonce: null,
  ciphertext: string,
  additional_data: string,
  public_nonce: string,
  key: string
): Promise<string> => {
  const result = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
    secret_nonce,
    from_base64(ciphertext),
    additional_data,
    from_base64(public_nonce),
    from_base64(key)
  );
  return to_base64(result);
};

export const crypto_generichash = async (
  hash_length: number,
  b64_password: string
): Promise<string> => {
  const result = sodium.crypto_generichash(
    hash_length,
    from_base64(b64_password)
  );
  return to_base64(result);
};

export const crypto_pwhash = async (
  keyLength: number,
  password: string,
  salt: string,
  opsLimit: number,
  memLimit: number,
  algorithm: number
): Promise<string> => {
  const result = sodium.crypto_pwhash(
    keyLength,
    password,
    from_base64(salt),
    opsLimit,
    memLimit,
    algorithm
  );
  return to_base64(result);
};

export const crypto_secretbox_easy = async (
  message: string,
  nonce: string,
  key: string
): Promise<string> => {
  const cipherText = sodium.crypto_secretbox_easy(
    from_base64(message),
    from_base64(nonce),
    from_base64(key)
  );
  return to_base64(cipherText);
};

export const crypto_secretbox_open_easy = async (
  ciphertext: string,
  nonce: string,
  key: string
): Promise<string> => {
  const message = sodium.crypto_secretbox_open_easy(
    from_base64(ciphertext),
    from_base64(nonce),
    from_base64(key)
  );
  return to_base64(message);
};

export const crypto_box_keypair = (): StringKeyPair => {
  const result = sodium.crypto_box_keypair();
  return {
    keyType: "curve25519",
    privateKey: to_base64(result.privateKey),
    publicKey: to_base64(result.publicKey),
  };
};

export const crypto_box_easy = async (
  message: string,
  nonce: string,
  recipientPublicKey: string,
  creatorPrivateKey: string
): Promise<string> => {
  const cipherText = sodium.crypto_box_easy(
    from_base64(message),
    from_base64(nonce),
    from_base64(recipientPublicKey),
    from_base64(creatorPrivateKey)
  );
  return to_base64(cipherText);
};

export const crypto_box_open_easy = async (
  ciphertext: string,
  nonce: string,
  creatorPublicKey: string,
  recipientPrivateKey: string
): Promise<string> => {
  const message = sodium.crypto_box_open_easy(
    from_base64(ciphertext),
    from_base64(nonce),
    from_base64(creatorPublicKey),
    from_base64(recipientPrivateKey)
  );
  return to_base64(message);
};

export const crypto_kdf_keygen = async (): Promise<string> => {
  return to_base64(sodium.crypto_kdf_keygen());
};

export const crypto_kdf_derive_from_key = async (
  subkey_len: number,
  subkey_id: number,
  context: string,
  key: string
): Promise<string> => {
  if ([...context].length !== sodium.crypto_kdf_CONTEXTBYTES) {
    throw new Error("crypto_kdf_derive_from_key context must be 8 bytes");
  }
  return to_base64(
    sodium.crypto_kdf_derive_from_key(
      subkey_len,
      subkey_id,
      context,
      from_base64(key)
    )
  );
};

const libsodiumExports = {
  ready,
  to_base64,
  from_base64,
  from_base64_to_string,
  randombytes_buf,
  randombytes_uniform,
  crypto_pwhash,
  crypto_generichash,
  crypto_box_keypair,
  crypto_sign_keypair,
  crypto_sign_detached,
  crypto_box_easy,
  crypto_box_open_easy,
  crypto_secretbox_easy,
  crypto_secretbox_open_easy,
  crypto_sign_verify_detached,
  crypto_aead_xchacha20poly1305_ietf_keygen,
  crypto_aead_xchacha20poly1305_ietf_encrypt,
  crypto_aead_xchacha20poly1305_ietf_decrypt,
  crypto_kdf_keygen,
  crypto_kdf_derive_from_key,
  base64_to_url_safe_base64: base64ToUrlSafeBase64,
  url_safe_base64_to_base64: urlSafeBase64ToBase64,
};

type Libsodium = typeof libsodiumExports & {
  crypto_generichash_BYTES: number;
  crypto_secretbox_NONCEBYTES: number;
  crypto_pwhash_SALTBYTES: number;
  crypto_pwhash_OPSLIMIT_INTERACTIVE: number;
  crypto_pwhash_MEMLIMIT_INTERACTIVE: number;
  crypto_pwhash_ALG_DEFAULT: number;
  crypto_secretbox_KEYBYTES: number;
  crypto_box_PUBLICKEYBYTES: number;
  crypto_box_SECRETKEYBYTES: number;
  crypto_aead_xchacha20poly1305_ietf_KEYBYTES: number;
  crypto_kdf_KEYBYTES: number;
};

const handler = {
  get(_target: Libsodium, prop: keyof Libsodium): any {
    if (prop === "crypto_generichash_BYTES") {
      return sodium.crypto_generichash_BYTES;
    } else if (prop === "crypto_secretbox_NONCEBYTES") {
      return sodium.crypto_secretbox_NONCEBYTES;
    } else if (prop === "crypto_pwhash_SALTBYTES") {
      return sodium.crypto_pwhash_SALTBYTES;
    } else if (prop === "crypto_pwhash_OPSLIMIT_INTERACTIVE") {
      return sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE;
    } else if (prop === "crypto_pwhash_MEMLIMIT_INTERACTIVE") {
      return sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE;
    } else if (prop === "crypto_pwhash_ALG_DEFAULT") {
      return sodium.crypto_pwhash_ALG_DEFAULT;
    } else if (prop === "crypto_secretbox_KEYBYTES") {
      return sodium.crypto_secretbox_KEYBYTES;
    } else if (prop === "crypto_box_PUBLICKEYBYTES") {
      return sodium.crypto_box_PUBLICKEYBYTES;
    } else if (prop === "crypto_box_SECRETKEYBYTES") {
      return sodium.crypto_box_SECRETKEYBYTES;
    } else if (prop === "crypto_aead_xchacha20poly1305_ietf_KEYBYTES") {
      return sodium.crypto_aead_xchacha20poly1305_ietf_KEYBYTES;
    } else if (prop === "crypto_kdf_KEYBYTES") {
      return sodium.crypto_kdf_KEYBYTES;
    }
    // @ts-ignore
    return Reflect.get(...arguments);
  },
};

export default new Proxy(libsodiumExports, handler) as Libsodium;
