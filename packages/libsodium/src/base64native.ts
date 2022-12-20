import { Buffer } from "buffer";
import { urlSafeBase64ToBase64 } from "./base64Conversion";

const keyParseStr =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

export const from_base64_to_string = (data: string): string => {
  for (let i = 0; i < data.length; i++) {
    const char = data.charAt(i);
    if (keyParseStr.indexOf(char) === -1) {
      throw new Error("invalid input");
    }
  }
  if (data.length === 0) {
    return "";
  } else {
    const decodedBase64Str = urlSafeBase64ToBase64(data);
    if (decodedBase64Str.includes(" ")) {
      throw new Error("incomplete input");
    }
    return Buffer.from(decodedBase64Str, "base64").toString("utf8");
  }
};
