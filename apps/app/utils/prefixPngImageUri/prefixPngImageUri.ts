export const prefixPngImageUri = (base64ImageData: string): string => {
  return `data:image/png;base64,${base64ImageData}`;
};
