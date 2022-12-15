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

export const initiateImagePicker = async ({
  encryptAndUploadFile,
  insertImage,
  updateFileAttributes,
}: Props) => {
  const filePickerResult = await ImagePicker.launchImageLibraryAsync({
    // mediaTypes: ImagePicker.MediaTypeOptions.All,
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: false, // later we can allow multiple selection
    allowsEditing: false,
    quality: 1,
    base64: true,
  });
  if (filePickerResult.cancelled || !filePickerResult.base64) {
    console.error("Failed to select an image");
    return;
  }

  insertImages({
    encryptAndUploadFile,
    filesAsBase64: [filePickerResult.base64],
    insertImage,
    updateFileAttributes,
  });
};
