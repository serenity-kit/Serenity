import { decryptAead } from "@naisho/core";
import {
  base64_variants,
  from_base64,
  to_base64,
} from "react-native-libsodium";

export type Props = {
  fileCiphertext: Uint8Array;
  publicNonce: string;
  key: string;
};
export const decryptFile = ({ fileCiphertext, publicNonce, key }: Props) => {
  const additionalData = "";
  const decodedFileData = decryptAead(
    fileCiphertext,
    additionalData,
    from_base64(key),
    publicNonce
  );
  const base64FileData = to_base64(decodedFileData, base64_variants.ORIGINAL);
  return base64FileData;
};
