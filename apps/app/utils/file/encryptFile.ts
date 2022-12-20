import {
  base64_variants,
  crypto_aead_xchacha20poly1305_ietf_encrypt,
  from_base64,
  randombytes_buf,
  to_base64,
} from "react-native-libsodium";

export type Props = {
  base64FileData: string;
  key: string;
};
export const encryptFile = ({ base64FileData, key }: Props) => {
  const publicNonce = randombytes_buf(24);
  const content = from_base64(base64FileData, base64_variants.ORIGINAL);
  const additionalData = "";
  const fileCiphertext = crypto_aead_xchacha20poly1305_ietf_encrypt(
    content,
    additionalData,
    null,
    publicNonce,
    from_base64(key)
  );
  return {
    fileCiphertext,
    publicNonce: to_base64(publicNonce),
  };
};
