import sodium from "@serenity-tools/libsodium";

export const registerInitialize = async (password: string) => {
  const message = await global._opaque.registerInitialize(password);
  return sodium.base64_to_url_safe_base64(message);
};

export const finishRegistration = async (challengeResponse: string) => {
  const message = await global._opaque.finishRegistration(
    sodium.url_safe_base64_to_base64(challengeResponse)
  );
  return sodium.base64_to_url_safe_base64(message);
};

export const startLogin = async (password: string) => {
  const message = await global._opaque.startLogin(password);
  return sodium.base64_to_url_safe_base64(message);
};

export const finishLogin = async (response: string) => {
  const result = await global._opaque.finishLogin(
    sodium.url_safe_base64_to_base64(response)
  );
  return {
    sessionKey: sodium.base64_to_url_safe_base64(result.sessionKey),
    exportKey: sodium.base64_to_url_safe_base64(result.exportKey),
    response: sodium.base64_to_url_safe_base64(result.response),
  };
};
