import sodium, { StringKeyPair } from "libsodium-wrappers";
export type { StringKeyPair, KeyPair, KeyType } from "libsodium-wrappers";
declare const Buffer;
export const ready = sodium.ready;

const to_base64 = (data: Uint8Array) => {
  const base64Data = Buffer.from(new Uint8Array(data))
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
  return base64Data;
};

const from_base64 = (data: string) => {
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
