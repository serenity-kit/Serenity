import sodium from "@serenity-tools/libsodium";
import { Button, Text, View } from "@serenity-tools/ui";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import { Image, useWindowDimensions } from "react-native";
import { RootStackScreenProps } from "../../../types/navigationProps";

export default function EncryptDecryptImageTestScreen(
  props: RootStackScreenProps<"EncryptDecryptImageTest">
) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const [base64ImageData, setBase64ImageData] = useState<string>("");
  const [chaChaNonce, setChaChaNonce] = useState<string>("");
  const [chaChaKey, setChaChaKey] = useState<string>("");
  const [chaChaEncryptedImageData, setChaChaEncryptedImageData] =
    useState<string>("");
  const [chaChaDecryptedImageData, setChaChaDecryptedImageData] =
    useState<string>("");

  useEffect(() => {
    createChaChaKeys();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });
    if (!result.cancelled && result.base64) {
      setBase64ImageData(result.base64);
    }
  };

  const getImage = (base64ImageData: string): string => {
    return `data:image/jpeg;base64,${base64ImageData}`;
  };

  const createChaChaKeys = () => {
    const key = sodium.crypto_aead_xchacha20poly1305_ietf_keygen();
    console.log(key);
    setChaChaKey(key);
  };

  const chaChaEncryptBase64ImageData = () => {
    const nonce = sodium.randombytes_buf(24);
    const additionalData = "";
    const encryptedImageData =
      sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
        base64ImageData,
        additionalData,
        null,
        nonce,
        chaChaKey
      );
    setChaChaNonce(nonce);
    setChaChaEncryptedImageData(encryptedImageData);
  };

  const chaChaDecryptBase64ImageData = () => {
    const additionalData = "";
    const decryptedImageData =
      sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
        null,
        chaChaEncryptedImageData,
        additionalData,
        chaChaNonce,
        chaChaKey
      );
    console.log(sodium.from_base64_to_string(decryptedImageData));
    setChaChaDecryptedImageData(
      sodium.from_base64_to_string(decryptedImageData)
    );
  };

  return (
    <View>
      <Text>Encrypt/Decrypt Image</Text>
      <Button onPress={pickImage}>Choose Image</Button>
      {base64ImageData != "" && (
        <Image
          source={{ uri: getImage(base64ImageData) }}
          style={{ width: 200, height: 200 }}
        />
      )}
      {base64ImageData != "" && (
        <Button onPress={chaChaEncryptBase64ImageData}>Encrypt Image</Button>
      )}
      {chaChaEncryptedImageData != "" && (
        <Button onPress={chaChaDecryptBase64ImageData}>Decrypt Image</Button>
      )}
      {chaChaEncryptedImageData != "" && (
        <Image
          source={{ uri: getImage(chaChaDecryptedImageData) }}
          style={{ width: 200, height: 200 }}
        />
      )}
    </View>
  );
}
