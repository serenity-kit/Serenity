import sodium from "@serenity-tools/libsodium";

export const decryptSessionJsonMessage = (
  encryptedMessage: string,
  nonce: string,
  clientSessionRxKey: string
) => {
  const b64OauthResponse = sodium.crypto_secretbox_open_easy(
    encryptedMessage,
    nonce,
    clientSessionRxKey
  );
  const oauthResponseBytes = sodium.from_base64(b64OauthResponse);
  const oauthResponseString = Buffer.from(oauthResponseBytes.buffer).toString(
    "utf-8"
  );
  const jsonResponse = JSON.parse(oauthResponseString);
  return jsonResponse;
};

export default {
  decryptSessionJsonMessage,
};
