import { hash as naishoHash } from "@naisho/core";
import sodium from "react-native-libsodium";

export const hash = (message: string | Uint8Array) =>
  naishoHash(message, sodium);
