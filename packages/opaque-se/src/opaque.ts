export const registerInitialize = async (password: string) => {
  return await global._opaque.registerInitialize(password);
};
