import sodium, { StringKeyPair } from "libsodium-wrappers";

export type { StringKeyPair, KeyPair, KeyType } from "libsodium-wrappers";

export const ready = sodium.ready;

export const to_base64 = (data: Uint8Array | string): string => {
  if (typeof data === "string") {
    return btoa(data);
  }
  return btoa(String.fromCharCode(...new Uint8Array(data)));
};

// sodium.crypto_aead_xchacha20poly1305_ietf_encrypt

// https://gist.github.com/borismus/1032746?permalink_comment_id=3557109#gistcomment-3557109
// Uint8Array.from(window.atob(base64Url.replace(/-/g, "+").replace(/_/g, "/")), (v) => v.charCodeAt(0));
export const from_base64 = (data: string): Uint8Array => {
  return Uint8Array.from(atob(data), (v) => v.charCodeAt(0));
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
