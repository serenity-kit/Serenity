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
