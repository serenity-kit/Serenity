export type GuessMimeTypeParams = {
  base64FileData: string;
};

export const guessMimeType = ({ base64FileData }: GuessMimeTypeParams) => {
  const isPng = base64FileData.startsWith("iVBORw0KGgo");
  if (isPng) {
    return "image/png";
  }
  const isJpg = base64FileData.startsWith("/9j/");
  if (isJpg) {
    return "image/jpeg";
  }
  const isGif = base64FileData.startsWith("R0lGODlh");
  if (isGif) {
    return "image/gif";
  }
  const isWebp = base64FileData.startsWith("UklGR");
  if (isWebp) {
    return "image/webp";
  }
  return "application/unrecognized";
};
