import { hash as secSyncHash } from "@serenity-tools/secsync";
import sodium from "react-native-libsodium";

export const hash = (message: string | Uint8Array) =>
  secSyncHash(message, sodium);
