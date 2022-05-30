import sodium from "@serenity-tools/libsodium";

export const registerInitialize = async (password: string) => {
  const message = await global._opaque.registerInitialize(password);
  return sodium.base64_to_url_safe_base64(message);
};
