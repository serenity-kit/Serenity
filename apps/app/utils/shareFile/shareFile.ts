import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import mime from "mime";

type Params = {
  contentAsBase64: string;
  mimeType: string;
  fileName: string;
};

export const shareFile = async ({
  contentAsBase64,
  mimeType,
  fileName,
}: Params) => {
  // @ts-expect-error - types are wrong
  const fileExtension = mime.getExtension(mimeType);
  const uri = `${FileSystem.cacheDirectory}${fileName}.${fileExtension}`;
  await FileSystem.writeAsStringAsync(uri, contentAsBase64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  await Sharing.shareAsync(uri);
  await FileSystem.deleteAsync(uri, { idempotent: true });
};
