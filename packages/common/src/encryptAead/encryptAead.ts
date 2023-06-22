import { encryptAead as secSyncEncryptAead } from "@serenity-tools/secsync";
import sodium from "react-native-libsodium";

export const encryptAead = (
  message: Uint8Array | string,
  additionalData: string,
  key: Uint8Array
) => secSyncEncryptAead(message, additionalData, key, sodium);
