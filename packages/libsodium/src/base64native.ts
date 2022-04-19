import { Buffer } from "buffer";

export const to_base64 = (data: Uint8Array | string): string => {
  const base64String = Buffer.from(data).toString("base64");
  return base64String
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
};

export const from_base64 = (data: string): Uint8Array => {
  const keyParseStr =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  for (let i = 0; i < data.length; i++) {
    const char = data.charAt(i);
    if (keyParseStr.indexOf(char) === -1) {
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
    return new Uint8Array(Buffer.from(decodedBase64Str, "base64"));
  }
};

export const from_base64_to_string = (data: string): string => {
  const keyParseStr =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  for (let i = 0; i < data.length; i++) {
    const char = data.charAt(i);
    if (keyParseStr.indexOf(char) === -1) {
      throw new Error("invalid input");
    }
  }
  if (data.length === 0) {
    return "";
  } else {
    let decodedBase64Str = data.replace("-", "+").replace("_", "/");
    while (decodedBase64Str.length % 4) {
      decodedBase64Str += "=";
    }
    if (decodedBase64Str.includes(" ")) {
      throw Error("incomplete input");
    }
    return Buffer.from(decodedBase64Str, "base64").toString("utf8");
  }
};
