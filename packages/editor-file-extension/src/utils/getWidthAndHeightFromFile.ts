import { Image as ImageNative, Platform } from "react-native";
import { guessMimeType } from "./guessMimeType";

export const getWidthAndHeightFromFile = (fileAsBase64: string) => {
  return new Promise<{ width: number; height: number } | null>(
    (resolve, reject) => {
      const mimeType = guessMimeType({ base64FileData: fileAsBase64 });
      const dataUri = `data:${mimeType};base64,${fileAsBase64}`;
      if (Platform.OS === "web") {
        const image = new Image();
        image.src = dataUri;
        image.onload = () => {
          resolve({ width: image.width, height: image.height });
        };
        image.onerror = () => {
          resolve(null);
        };
      } else {
        ImageNative.getSize(
          dataUri,
          (width, height) => resolve({ width, height }),
          reject
        );
      }
    }
  );
};
