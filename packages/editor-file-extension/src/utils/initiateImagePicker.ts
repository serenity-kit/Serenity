import * as ImagePicker from "expo-image-picker";
import {
  EncryptAndUploadFunctionFile,
  InsertImageParams,
  UpdateFileAttributesParams,
} from "../types";
import { insertImages } from "./insertImages";

type Props = {
  encryptAndUploadFile: EncryptAndUploadFunctionFile;
  insertImage: ({ uploadId, width, height }: InsertImageParams) => void;
  updateFileAttributes: (params: UpdateFileAttributesParams) => void;
};

const extractMimeType = (uri: string) => {
  const splitUri = uri.split(";");
  return splitUri[0].replace("data:", "");
};

export const initiateImagePicker = async ({
  encryptAndUploadFile,
  insertImage,
  updateFileAttributes,
}: Props) => {
  const filePickerResult = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: false, // later we can allow multiple selection
    allowsEditing: false,
    quality: 1,
    base64: true,
  });
  if (
    filePickerResult.canceled ||
    !filePickerResult.assets ||
    !filePickerResult.assets[0]
  ) {
    console.error("Failed to select an image");
    return;
  }

  insertImages({
    encryptAndUploadFile,
    filesWithBase64Content: [
      {
        content: filePickerResult.assets[0].base64!,
        mimeType: extractMimeType(filePickerResult.assets[0].uri),
      },
    ],
    insertImage,
    updateFileAttributes,
  });
};
