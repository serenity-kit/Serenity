import { Image as ImageNative, Platform } from "react-native";

export const getWidthAndHeightFromFile = (file: File) => {
  return new Promise<{ width: number; height: number } | null>(
    (resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function (event) {
        if (!event.target?.result || typeof event.target.result !== "string") {
          resolve(null);
          return;
        }

        if (Platform.OS === "web") {
          const image = new Image();
          image.src = event.target.result;
          image.onload = () => {
            resolve({ width: image.width, height: image.height });
          };
          image.onerror = () => {
            resolve(null);
          };
        } else {
          ImageNative.getSize(
            event.target.result,
            (width, height) => resolve({ width, height }),
            reject
          );
        }
      };
    }
  );
};
