import * as ImagePicker from "expo-image-picker";
import {
  EncryptAndUploadFunctionFile,
  InsertImageParams,
  UpdateImageAttributesParams,
} from "../types";
import { base64ToFile } from "./base64ToFile";
import { insertImages } from "./insertImages";

type Props = {
  encryptAndUploadFile: EncryptAndUploadFunctionFile;
  insertImage: ({ uploadId, width, height }: InsertImageParams) => void;
  updateImageAttributes: (params: UpdateImageAttributesParams) => void;
};

export const initiateImagePicker = async ({
  encryptAndUploadFile,
  insertImage,
  updateImageAttributes,
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

  const image = base64ToFile({
    base64: filePickerResult.base64,
    fileName: filePickerResult.fileName || undefined,
  });

  insertImages({
    encryptAndUploadFile,
    images: [image],
    insertImage,
    updateImageAttributes,
  });
};
