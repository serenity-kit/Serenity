import { decode } from "base-64"; // libsodium also provides the functionality, but we currently don't want to include the entire libsodium package just for base64 decoding
import { guessMimeType } from "./guessMimeType";

type Base64ToFileParams = {
  base64: string;
  fileName?: string;
};

const mimeTypeToExtension = (mimeType: string) => {
  if (mimeType === "image/jpeg") {
    return `.jpg`;
  }
  if (mimeType === "image/png") {
    return `.png`;
  }
  if (mimeType === "image/gif") {
    return `.gif`;
  }
  if (mimeType == "image/webp") {
    return `.webp`;
  }
};

export const base64ToFile = ({ base64, fileName }: Base64ToFileParams) => {
  const mimetype = guessMimeType({ base64FileData: base64 });
  const decodedData = decode(base64);
  let n = decodedData.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = decodedData.charCodeAt(n);
  }

  return new File(
    [u8arr],
    fileName || `image.${mimeTypeToExtension(mimetype)}`,
    { type: mimetype }
  );
};
