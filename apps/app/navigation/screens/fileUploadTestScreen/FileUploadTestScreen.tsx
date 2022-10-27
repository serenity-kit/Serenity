import sodium from "@serenity-tools/libsodium";
import { Button, Text, View } from "@serenity-tools/ui";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Image, useWindowDimensions } from "react-native";
import {
  runFileUrlQuery,
  runInitiateFileUploadMutation,
} from "../../../generated/graphql";
import { useWorkspaceContext } from "../../../hooks/useWorkspaceContext";
import { useActiveDocumentInfoStore } from "../../../utils/document/activeDocumentInfoStore";
import { useFolderKeyStore } from "../../../utils/folder/folderKeyStore";
import { getLastUsedWorkspaceId } from "../../../utils/lastUsedWorkspaceAndDocumentStore/lastUsedWorkspaceAndDocumentStore";

export default function FileUploadTestScreen() {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const [chaChaNonce, setChaChaNonce] = useState("");
  const [chaChaKey, setChaChaKey] = useState("");
  const [chaChaDecryptedImageData, setChaChaDecryptedImageData] = useState("");
  const [chaChaEncryptedImageData, setChaChaEncryptedImageData] = useState("");
  const [base64ImageData, setBase64ImageData] = useState("");
  const [FileId, setFileId] = useState("");

  // get document and workspace stuff
  const workspaceId = getLastUsedWorkspaceId();
  const document = useActiveDocumentInfoStore((state) => state.document);
  const { activeDevice } = useWorkspaceContext();
  const getFolderKey = useFolderKeyStore((state) => state.getFolderKey);

  const [testChaChaEncryptedImageData, setTestChaChaEncryptedImageData] =
    useState("");
  // const [testChaChaNonce, setTestChaChaNonce] = useState("");

  const pickImage = async () => {
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

    setBase64ImageData(filePickerResult.base64); // used to show the image right away

    const key = await sodium.crypto_aead_xchacha20poly1305_ietf_keygen();
    setChaChaKey(key);

    const nonce = await sodium.randombytes_buf(24);
    setChaChaNonce(nonce);
    const additionalData = "";
    const encryptedImageData =
      await sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
        filePickerResult.base64,
        additionalData,
        null,
        nonce,
        key
      );

    // setTestChaChaEncryptedImageData(encryptedImageData);

    const documentId = "invalid";
    const workspaceId = "invalid";

    const result = await runInitiateFileUploadMutation(
      {
        initiateFileUpload: {
          documentId,
          workspaceId,
        },
      },
      {}
    );
    const uploadUrl = result.data?.initiateFileUpload?.uploadUrl;
    const fileId = result.data?.initiateFileUpload?.fileId;
    if (!uploadUrl || !fileId) {
      alert("Missing upload Url or fileId");
      console.error("Missing upload Url or fileId");
      return;
    }
    // const formData = new FormData();
    // formData.append("data", encryptedImageData);
    // formData.append("data", new Blob([sodium.from_base64(encryptedImageData)]));

    const response = await fetch(uploadUrl, {
      method: "PUT",
      body: encryptedImageData,
    });
    // TODO check on response if it fails

    setFileId(fileId);
  };

  const formatInlineImage = (base64ImageData: string): string => {
    return `data:image/jpeg;base64,${base64ImageData}`;
  };

  const downloadAndDecrypt = async () => {
    const result = await runFileUrlQuery({ fileId: FileId });

    if (!result.data?.fileUrl?.downloadUrl) {
      alert("Failed to get the file URL");
      console.error("Failed to get the file URL");
      return;
    }

    const response = await fetch(result.data?.fileUrl.downloadUrl);

    console.log(response);

    // console.log({ response });
    // const arrayBuffer = await response.arrayBuffer();
    // console.log("arrayBuffer", arrayBuffer);
    // const encryptedImageBytes = new Uint8Array(Buffer.from(arrayBuffer));
    // console.log("encryptedImageBytes", encryptedImageBytes);
    // const chaChaEncryptedImageData =
    //   Buffer.from(encryptedImageBytes).toString("utf-8");
    const text = await response.text();
    console.log("OOOOOOO", text);
    const additionalData = "";
    const decryptedImageData =
      await sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
        null,
        text,
        additionalData,
        chaChaNonce,
        chaChaKey
      );
    console.log("OOOOOOO2", sodium.from_base64_to_string(decryptedImageData));
    setChaChaEncryptedImageData(chaChaEncryptedImageData);
    setChaChaDecryptedImageData(
      sodium.from_base64_to_string(decryptedImageData)
    );
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
      <Text>R2 File URL: {FileId}</Text>
      {FileId !== "" && (
        <Button onPress={downloadAndDecrypt}>Download & decrypt image</Button>
      )}
      {chaChaEncryptedImageData !== "" && (
        <Image
          source={{ uri: formatInlineImage(chaChaDecryptedImageData) }}
          style={{ width: 200, height: 200 }}
        />
      )}
    </View>
  );
}
