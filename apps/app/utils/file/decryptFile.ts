import * as sodium from "@serenity-tools/libsodium";

export type Props = {
  encryptedBase64FileData: string;
  publicNonce: string;
  key: string;
};
export const decryptFile = async ({
  encryptedBase64FileData,
  publicNonce,
  key,
}: Props) => {
  const additionalData = "";
  const decodedFileData =
    await sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
      null,
      encryptedBase64FileData,
      additionalData,
      publicNonce,
      key
    );
  const base64FileData = sodium.from_base64_to_string(decodedFileData);
  return base64FileData;
};
