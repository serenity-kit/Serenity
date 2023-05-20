import { encryptAead } from "@serenity-tools/common";
import { base64_variants, from_base64 } from "react-native-libsodium";

export type Props = {
  base64FileData: string;
  key: string;
};
export const encryptFile = ({ base64FileData, key }: Props) => {
  const content = from_base64(base64FileData, base64_variants.ORIGINAL);
  const additionalData = "";
  const { ciphertext, publicNonce } = encryptAead(
    content,
    additionalData,
    from_base64(key)
  );
  return {
    fileCiphertext: from_base64(ciphertext),
    publicNonce,
  };
};
