import * as sodium from "@serenity-tools/libsodium";

export type Props = {
  base64FileData: string;
  key: string;
};
export const encryptFile = async ({ base64FileData, key }: Props) => {
  const publicNonce = await sodium.randombytes_buf(24);
  const additionalData = "";
  const encryptedBase64ImageData =
    await sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
      base64FileData,
      additionalData,
      null,
      publicNonce,
      key
    );
  return {
    encryptedBase64ImageData,
    publicNonce,
  };
};
