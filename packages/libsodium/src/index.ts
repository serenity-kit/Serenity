import sodium, { StringKeyPair } from "libsodium-wrappers";

export { StringKeyPair, KeyPair, KeyType } from "libsodium-wrappers";

export const to_base64 = (data: Uint8Array | string): string => {
  if (typeof data === "string") {
    return btoa(data);
  }
  return btoa(String.fromCharCode(...new Uint8Array(data)));
};

// https://gist.github.com/borismus/1032746?permalink_comment_id=3557109#gistcomment-3557109
// Uint8Array.from(window.atob(base64Url.replace(/-/g, "+").replace(/_/g, "/")), (v) => v.charCodeAt(0));
export const from_base64 = (data: string): Uint8Array => {
  return Uint8Array.from(atob(data), (v) => v.charCodeAt(0));
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

export default {
  to_base64,
  from_base64,
  randombytes_buf,
  crypto_sign_keypair,
  crypto_sign_detached,
};
