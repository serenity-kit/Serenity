import { Image as ImageNative, Platform } from "react-native";

type Params = {
  fileAsBase64: string;
  mimeType: string;
};

export const getImageDimensions = ({ fileAsBase64, mimeType }: Params) => {
  return new Promise<{ width: number; height: number } | null>(
    (resolve, reject) => {
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
