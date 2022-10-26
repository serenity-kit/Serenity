import {
  createDocumentKey,
  encryptDocumentTitle,
} from "@serenity-tools/common";
import sodium from "@serenity-tools/libsodium";
import { Button, Text, View } from "@serenity-tools/ui";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Image, useWindowDimensions } from "react-native";
import { runInitiateFileUploadMutation } from "../../../generated/graphql";
import { useWorkspaceContext } from "../../../hooks/useWorkspaceContext";
import { useActiveDocumentInfoStore } from "../../../utils/document/activeDocumentInfoStore";
import { buildKeyDerivationTrace } from "../../../utils/folder/buildKeyDerivationTrace";
import { useFolderKeyStore } from "../../../utils/folder/folderKeyStore";
import { getFolder } from "../../../utils/folder/getFolder";
import { getLastUsedWorkspaceId } from "../../../utils/lastUsedWorkspaceAndDocumentStore/lastUsedWorkspaceAndDocumentStore";
import { getWorkspace } from "../../../utils/workspace/getWorkspace";

export default function FileUploadTestScreen() {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const [chaChaNonce, setChaChaNonce] = useState("");
  const [chaChaKey, setChaChaKey] = useState("");
  const [chaChaDecryptedImageData, setChaChaDecryptedImageData] = useState("");
  const [chaChaEncryptedImageData, setChaChaEncryptedImageData] = useState("");
  const [base64ImageData, setBase64ImageData] = useState("");
  const [r2FileUrl, setR2FileUrl] = useState("");

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

    setTestChaChaEncryptedImageData(encryptedImageData);

    const documentId = "invalid";
    const workspaceId = "invalid";
    const workspace = await getWorkspace({
      workspaceId,
      deviceSigningPublicKey: activeDevice.signingPublicKey,
    });
    if (!workspace) {
      console.error("No workspace defined. Try logging in again");
      return;
    }
    if (!document) {
      console.error("No document defined. Try selecting a document");
    }
    const keyDerivationTrace = await buildKeyDerivationTrace({
      workspaceKeyId: workspace.currentWorkspaceKey?.id!,
      folderId: document?.parentFolderId,
    });
    const folder = await getFolder({ id: document?.parentFolderId! });
    const folderKey = await getFolderKey({
      folderId: folder.id,
      workspaceKeyId: undefined,
      workspaceId: workspaceId,
      folderSubkeyId: folder.subkeyId,
      activeDevice,
    });
    const imageUrlKey = await createDocumentKey({ folderKey });

    const encryptedUrlData = await encryptDocumentTitle({
      title: filePickerResult.fileName!,
      key: imageUrlKey.key,
      publicData: null,
    });
    const result = await runInitiateFileUploadMutation(
      {
        initiateFileUpload: {
          documentId,
          workspaceId,
          // encryptedUrl: encryptedUrlData.cipherText,
          // encryptedUrlNonce: encryptedUrlData.publicNonce,
          // subkeyId: imageUrlKey.subkeyId,
          // keyDerivationTrace,
        },
      },
      {}
    );
    console.log({ result });
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

  const formatInlineImage = (base64ImageData: string): string => {
    return `data:image/jpeg;base64,${base64ImageData}`;
  };

  const downloadAndDecrypt = async () => {
    // const response = await fetch(r2FileUrl);
    // console.log({ response });
    // const arrayBuffer = await response.arrayBuffer();
    const encryptedImageBytes = new Uint8Array(
      Buffer.from(testChaChaEncryptedImageData)
    );
    const chaChaEncryptedImageData =
      Buffer.from(encryptedImageBytes).toString("utf-8");
    const additionalData = "";
    const decryptedImageData =
      await sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
        null,
        chaChaEncryptedImageData,
        additionalData,
        chaChaNonce,
        chaChaKey
      );
    console.log(sodium.from_base64_to_string(decryptedImageData));
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
      <Text>R2 File URL: {r2FileUrl}</Text>
      {r2FileUrl !== "" && (
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
