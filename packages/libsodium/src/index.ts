import sodium, { StringKeyPair } from "libsodium-wrappers";

export { StringKeyPair, KeyPair, KeyType } from "libsodium-wrappers";

export const randombytes_buf = async (length: number): Promise<string> =>
  sodium.randombytes_buf(length, "base64");

export const crypto_sign_keypair = async (): Promise<StringKeyPair> =>
  sodium.crypto_sign_keypair("base64");

export const crypto_sign_detached = async (
  message: string,
  privateKey: string
): Promise<string> =>
  sodium.crypto_sign_detached(
    message,
    sodium.from_base64(privateKey),
    "base64"
  );

export default {
  randombytes_buf,
  crypto_sign_keypair,
  crypto_sign_detached,
};
