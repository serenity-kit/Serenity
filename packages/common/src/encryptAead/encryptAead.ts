import { encryptAead as naishoEncryptAead } from "@naisho/core";
import sodium from "react-native-libsodium";

export const encryptAead = (
  message: Uint8Array | string,
  additionalData: string,
  key: Uint8Array
) => naishoEncryptAead(message, additionalData, key, sodium);
