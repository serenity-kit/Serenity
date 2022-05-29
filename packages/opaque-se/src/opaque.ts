export const registerInitialize = async (password: string) => {
  // @ts-expect-error not typed yet
  return await global._opaque.registerInitialize(password);
};
