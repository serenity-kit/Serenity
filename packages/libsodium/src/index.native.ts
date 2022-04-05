import sodium from "react-native-sodium-expo-plugin";

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

export const randombytes_buf = async (length: number): Promise<string> =>
  sodium.randombytes_buf(length);

export const crypto_sign_keypair = async (): Promise<StringKeyPair> => {
  const result = await sodium.crypto_sign_keypair();
  return {
    keyType: "ed25519",
    privateKey: result.sk,
    publicKey: result.pk,
  };
};

export const crypto_sign_detached = async (
  message: string,
  privateKey: string
): Promise<string> => sodium.crypto_sign_detached(message, privateKey);

export default {
  randombytes_buf,
  crypto_sign_keypair,
  crypto_sign_detached,
};
