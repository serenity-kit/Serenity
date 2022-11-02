import { guessMimeType } from "@serenity-tools/editor-image-extension";
import { Button, Text, View } from "@serenity-tools/ui";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Image, useWindowDimensions } from "react-native";
import { downloadFileBase64Bytes } from "../../../utils/file/createDownloadAndDecryptFileFunction";
import { encryptAndUploadFile } from "../../../utils/file/encryptAndUploadFile";

export default function FileUploadTestScreen() {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const [chaChaNonce, setChaChaNonce] = useState("");
  const [chaChaKey, setChaChaKey] = useState("");
  const [chaChaDecryptedImageData, setChaChaDecryptedImageData] = useState("");
  const [base64ImageData, setBase64ImageData] = useState("");
  const [fileId, setFileId] = useState("");

  const documentId = "invalid";
  const workspaceId = "invalid";

  const pickImage = async () => {
    setFileId("");
    const filePickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });
    if (filePickerResult.cancelled || !filePickerResult.base64) {
      alert("Failed to select an image");
      console.error("Failed to select an image");
      return;
    }
    // pre-populate the client-image data to
    // used to show the image right away
    setBase64ImageData(filePickerResult.base64);
    setChaChaDecryptedImageData("");

    const { fileId, key, publicNonce } = await encryptAndUploadFile({
      base64FileData: filePickerResult.base64,
      documentId,
      workspaceId,
    });

    setFileId(fileId);
    setChaChaKey(key);
    setChaChaNonce(publicNonce);
  };

  const formatInlineImage = (base64ImageData: string): string => {
    const mimeType = guessMimeType({
      base64FileData: base64ImageData,
    });
    if (mimeType === "image/jpeg") {
      return `data:image/jpeg;base64,${base64ImageData}`;
    }
    if (mimeType === "image/png") {
      return `data:image/png;base64,${base64ImageData}`;
    }
    if (mimeType === "image/gif") {
      return `data:image/gif;base64,${base64ImageData}`;
    }
    if (mimeType == "image/webp") {
      return `data:image/webp;base64,${base64ImageData}`;
    }
    console.error("Unknown image type");
    return "";
  };

  const downloadAndDecrypt = async () => {
    const decryptedImageData = await downloadFileBase64Bytes({
      fileId: fileId,
      workspaceId,
      documentId,
      key: chaChaKey,
      publicNonce: chaChaNonce,
    });
    setChaChaDecryptedImageData(decryptedImageData);
  };

  return (
    <View>
      <Text>Encrypt/Decrypt Image</Text>
      <Button onPress={pickImage}>Choose, encrypt and upload Image</Button>
      {base64ImageData != "" && (
        <Image
          source={{ uri: formatInlineImage(base64ImageData) }}
          style={{ width: 200, height: 200 }}
        />
      )}
      <Text>R2 File URL: {fileId}</Text>
      {fileId !== "" && (
        <Button onPress={downloadAndDecrypt}>Download & decrypt image</Button>
      )}
      {chaChaDecryptedImageData !== "" && (
        <Image
          source={{ uri: formatInlineImage(chaChaDecryptedImageData) }}
          style={{ width: 200, height: 200 }}
        />
      )}
    </View>
  );
}
