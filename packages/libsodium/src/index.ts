import sodium /* , { StringKeyPair } */ from "libsodium-wrappers-sumo";
// export type { StringKeyPair, KeyPair, KeyType } from "libsodium-wrappers";
declare const Buffer;
export const ready = sodium.ready;

export type KeyType = "curve25519" | "ed25519" | "x25519";

export interface StringKeyPair {
  keyType: KeyType;
  privateKey: string;
  publicKey: string;
}

const to_base64 = (data: Uint8Array | string) => {
  let base64Data = "";
  if (typeof data === "string") {
    base64Data = btoa(data);
  } else {
    base64Data = Buffer.from(data).toString("base64");
  }
  base64Data = base64Data
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
  return base64Data;
};

const from_base64 = (data: string) => {
  console.log({ data });
  const keyStr =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  for (let i = 0; i < data.length; i++) {
    const char = data.charAt(i);
    if (keyStr.indexOf(char) === -1) {
      throw new Error("invalid input");
    }
  }
  if (data.length === 0) {
    return new Uint8Array([]);
  } else {
    let decodedBase64Str = data.replace("-", "+").replace("_", "/");
    while (decodedBase64Str.length % 4) {
      decodedBase64Str += "=";
    }
    if (decodedBase64Str.includes(" ")) {
      throw Error("incomplete input");
    }
    const buffer = Buffer.from(decodedBase64Str, "base64");
    const bytes = new Uint8Array(buffer);
    if (bytes.length == 0) {
      throw new Error("invalid input");
    }
    return bytes;
  }
};

export const from_base64_to_string = (data: string): string => {
  return atob(data);
};

export const randombytes_buf = async (length: number): Promise<string> => {
  const result = await sodium.randombytes_buf(length);
  return to_base64(result);
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
  privateKey: string
): Promise<boolean> => {
  return await sodium.crypto_sign_verify_detached(
    from_base64(signature),
    message,
    from_base64(privateKey)
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

export const crypto_core_ed25519_scalar_random = async (): Promise<string> => {
  const result = sodium.crypto_core_ed25519_scalar_random();
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

export const crypto_core_ed25519_from_uniform = async (
  uniform: string
): Promise<string> => {
  const result = sodium.crypto_core_ed25519_from_uniform(from_base64(uniform));
  return to_base64(result);
};

export const crypto_scalarmult_ed25519_base_noclamp = async (
  scalar: string
): Promise<string> => {
  const result = sodium.crypto_scalarmult_ed25519_base_noclamp(
    from_base64(scalar)
  );
  return to_base64(result);
};

export const crypto_core_ed25519_add = async (
  scalar1: string,
  scalar2: string
): Promise<string> => {
  const result = sodium.crypto_core_ed25519_add(
    from_base64(scalar1),
    from_base64(scalar2)
  );
  return to_base64(result);
};

export const crypto_core_ed25519_scalar_negate = async (
  scalar: string
): Promise<string> => {
  const result = sodium.crypto_core_ed25519_scalar_negate(from_base64(scalar));
  return to_base64(result);
};

export const crypto_scalarmult_ed25519_noclamp = async (
  scalar: string,
  point: string
): Promise<string> => {
  const result = sodium.crypto_scalarmult_ed25519_noclamp(
    from_base64(scalar),
    from_base64(point)
  );
  return to_base64(result);
};

export const crypto_generichash_batch = async (
  arr: Array<string>
): Promise<string> => {
  const key = Buffer.alloc(sodium.crypto_generichash_KEYBYTES);
  const state = sodium.crypto_generichash_init(
    key,
    sodium.crypto_generichash_BYTES
  );
  arr.forEach((item) => {
    sodium.crypto_generichash_update(state, item);
  });
  const combinedHash = sodium.crypto_generichash_final(
    state,
    sodium.crypto_generichash_BYTES
  );
  return to_base64(combinedHash);
};

export const crypto_kx_keypair = (): StringKeyPair => {
  const result = sodium.crypto_kx_keypair();
  return {
    keyType: "curve25519",
    privateKey: to_base64(result.privateKey),
    publicKey: to_base64(result.publicKey),
  };
};

export const crypto_pwhash = (
  keyLength: number,
  password: string,
  salt: string,
  opsLimit: number,
  memLimit: number,
  algorithm: number
): string => {
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

export const crypto_secretbox_easy = (
  message: string,
  nonce: string,
  key: string
): string => {
  const result = sodium.crypto_secretbox_easy(
    message,
    from_base64(nonce),
    from_base64(key)
  );
  return to_base64(result);
};

const libsodiumExports = {
  ready,
  to_base64,
  from_base64,
  from_base64_to_string,
  crypto_pwhash,
  randombytes_buf,
  crypto_kx_keypair,
  crypto_generichash,
  crypto_sign_keypair,
  crypto_sign_detached,
  crypto_secretbox_easy,
  crypto_core_ed25519_add,
  crypto_generichash_batch,
  crypto_sign_verify_detached,
  crypto_core_ed25519_from_uniform,
  crypto_core_ed25519_scalar_random,
  crypto_core_ed25519_scalar_negate,
  crypto_scalarmult_ed25519_noclamp,
  crypto_scalarmult_ed25519_base_noclamp,
  crypto_aead_xchacha20poly1305_ietf_keygen,
  crypto_aead_xchacha20poly1305_ietf_encrypt,
  crypto_aead_xchacha20poly1305_ietf_decrypt,
};

const handler = {
  get(_target: any, prop: string): any {
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
    }
    // @ts-ignore
    return Reflect.get(...arguments);
  },
};

export default new Proxy(libsodiumExports, handler);
