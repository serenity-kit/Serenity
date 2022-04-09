import sodium from "react-native-sodium-expo-plugin";
import { Buffer } from "buffer";

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

export const to_base64 = (data: Uint8Array | string): string =>
  Buffer.from(data).toString("base64");

// inspired by https://github.com/eranbo/react-native-base64/blob/master/base64.js
export const from_base64 = (data: string): Uint8Array =>
  Buffer.from(data, "base64");

const keyStr =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

export const from_base64_to_string = (input: string): string => {
  let output = "";
  let chr1: number | string = "";
  let chr2: number | string = "";
  let chr3: number | string = "";
  let chr4: number | string = "";

  let enc1: number | string = "";
  let enc2: number | string = "";
  let enc3: number | string = "";
  let enc4: number | string = "";

  let i = 0;

  // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
  let base64test = /[^A-Za-z0-9\+\/\=]/g;
  if (base64test.exec(input)) {
    throw new Error(
      "There were invalid base64 characters in the input text.\n" +
        "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
        "Expect errors in decoding."
    );
  }
  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

  do {
    enc1 = keyStr.indexOf(input.charAt(i++));
    enc2 = keyStr.indexOf(input.charAt(i++));
    enc3 = keyStr.indexOf(input.charAt(i++));
    enc4 = keyStr.indexOf(input.charAt(i++));

    chr1 = (enc1 << 2) | (enc2 >> 4);
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    chr3 = ((enc3 & 3) << 6) | enc4;

    output = output + String.fromCharCode(chr1);

    if (enc3 != 64) {
      output = output + String.fromCharCode(chr2);
    }
    if (enc4 != 64) {
      output = output + String.fromCharCode(chr3);
    }

    chr1 = chr2 = chr3 = "";
    enc1 = enc2 = enc3 = enc4 = "";
  } while (i < input.length);

  return output;
};

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
): Promise<string> =>
  sodium.crypto_sign_detached(to_base64(message), privateKey);

export const crypto_aead_xchacha20poly1305_ietf_keygen =
  async (): Promise<string> =>
    sodium.crypto_aead_xchacha20poly1305_ietf_keygen();

export const crypto_aead_xchacha20poly1305_ietf_encrypt = async (
  message: string,
  additional_data: string,
  secret_nonce: null,
  public_nonce: string,
  key: string
): Promise<string> => {
  const result = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    to_base64(message),
    to_base64(additional_data),
    public_nonce,
    key
  );
  return result;
};

export const crypto_aead_xchacha20poly1305_ietf_decrypt = async (
  secret_nonce: null,
  ciphertext: string,
  additional_data: string,
  public_nonce: string,
  key: string
): Promise<string> => {
  const result = await sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
    ciphertext,
    to_base64(additional_data),
    public_nonce,
    key
  );
  return result;
};

export default {
  to_base64,
  from_base64,
  from_base64_to_string,
  randombytes_buf,
  crypto_sign_keypair,
  crypto_sign_detached,
  crypto_aead_xchacha20poly1305_ietf_keygen,
  crypto_aead_xchacha20poly1305_ietf_encrypt,
  crypto_aead_xchacha20poly1305_ietf_decrypt,
};
