import { decryptAead as naishoDecryptAead } from "@naisho/core";
import sodium from "react-native-libsodium";

export const decryptAead = (
  ciphertext: Uint8Array,
  additionalData: string,
  key: Uint8Array,
  publicNonce: string
) => naishoDecryptAead(ciphertext, additionalData, key, publicNonce, sodium);
