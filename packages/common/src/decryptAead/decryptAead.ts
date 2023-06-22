import { decryptAead as secSyncDecryptAead } from "@serenity-tools/secsync";
import sodium from "react-native-libsodium";

export const decryptAead = (
  ciphertext: Uint8Array,
  additionalData: string,
  key: Uint8Array,
  publicNonce: string
) => secSyncDecryptAead(ciphertext, additionalData, key, publicNonce, sodium);
