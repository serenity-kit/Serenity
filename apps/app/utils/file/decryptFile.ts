import {
  base64_variants,
  crypto_aead_xchacha20poly1305_ietf_decrypt,
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
  const decodedFileData = crypto_aead_xchacha20poly1305_ietf_decrypt(
    null,
    fileCiphertext,
    additionalData,
    from_base64(publicNonce),
    from_base64(key)
  );
  const base64FileData = to_base64(decodedFileData, base64_variants.ORIGINAL);
  return base64FileData;
};
