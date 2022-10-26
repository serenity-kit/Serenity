import sodium from "@serenity-tools/libsodium";
import { Button, Text, View } from "@serenity-tools/ui";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Image, useWindowDimensions } from "react-native";
import {
  runInitiateFileUploadMutation,
  useInitiateFileUploadMutation,
} from "../../../generated/graphql";

export default function FileUploadTestScreen() {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const [chaChaNonce, setChaChaNonce] = useState("");
  const [chaChaKey, setChaChaKey] = useState("");
  const [base64ImageData, setBase64ImageData] = useState("");
  const [r2FileUrl, setR2FileUrl] = useState("");
  const [, initiateFileUploadMutation] = useInitiateFileUploadMutation();

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
    const fileUrl = result.data?.initiateFileUpload?.fileUrl;
    if (!uploadUrl || !fileUrl) {
      alert("Missing upload Url");
      console.error("Missing upload Url");
      return;
    }
    const formData = new FormData();
    formData.append("data", encryptedImageData);

    const response = await fetch(uploadUrl, {
      method: "PUT",
      body: formData,
    });
    // TODO check on response if it fails

    setR2FileUrl(fileUrl);
  };

  const getImage = (base64ImageData: string): string => {
    return `data:image/jpeg;base64,${base64ImageData}`;
  };

  const downloadAndDecrypt = async () => {
    const response = await fetch(r2FileUrl);

    console.log("response", response);

    // const additionalData = "";
    // const decryptedImageData =
    //   await sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
    //     null,
    //     chaChaEncryptedImageData,
    //     additionalData,
    //     chaChaNonce,
    //     chaChaKey
    //   );
    // console.log(sodium.from_base64_to_string(decryptedImageData));
    // setChaChaDecryptedImageData(
    //   sodium.from_base64_to_string(decryptedImageData)
    // );
  };

  return (
    <View>
      <Text>Encrypt/Decrypt Image</Text>
      <Button onPress={pickImage}>Choose, encrypt and upload Image</Button>
      {base64ImageData != "" && (
        <Image
          source={{ uri: getImage(base64ImageData) }}
          style={{ width: 200, height: 200 }}
        />
      )}
      <Text>R2 File URL: {r2FileUrl}</Text>
      {r2FileUrl !== "" && (
        <Button onPress={downloadAndDecrypt}>Download & decrypt image</Button>
      )}
      {/* {chaChaEncryptedImageData !== "" && (
        <Image
          source={{ uri: getImage(chaChaDecryptedImageData) }}
          style={{ width: 200, height: 200 }}
        />
      )} */}
    </View>
  );
}
