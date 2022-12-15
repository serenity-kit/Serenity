import * as ImagePicker from "expo-image-picker";
import {
  EncryptAndUploadFunctionFile,
  InsertFileParams,
  UpdateFileAttributesParams,
} from "../types";
import { insertFiles } from "./insertFiles";

type Props = {
  encryptAndUploadFile: EncryptAndUploadFunctionFile;
  insertFile: ({ uploadId, fileName, fileSize }: InsertFileParams) => void;
  updateFileAttributes: (params: UpdateFileAttributesParams) => void;
};

export const initiateFilePicker = async ({
  encryptAndUploadFile,
  insertFile,
  updateFileAttributes,
}: Props) => {
  const filePickerResult = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.All,
    allowsMultipleSelection: false, // later we can allow multiple selection
    allowsEditing: false,
    quality: 1,
    base64: true,
  });

  if (filePickerResult.cancelled || !filePickerResult.assets) {
    console.error("Failed to select a file");
    return;
  }

  insertFiles({
    encryptAndUploadFile,
    filesAsBase64: [filePickerResult.assets[0].uri],
    insertFile,
    updateFileAttributes,
  });
};
