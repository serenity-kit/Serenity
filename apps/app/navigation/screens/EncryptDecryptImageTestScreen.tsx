import React, { useState, useEffect } from "react";
import { Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Text, View, Button } from "@serenity-tools/ui";
import sodium from "@serenity-tools/libsodium";

export default function EncryptDecryptImageTestScreen() {
  const [imageUri, setImageUri] = useState<string>("");
  const [base64ImageData, setBase64ImageData] = useState<string>("");
  const [openBoxKey, setOpenBoxKey] = useState<string>("");
  const [openBoxNonce, setOpenBoxNonce] = useState<string>("");
  const [openBoxEncryptedImageData, setOpenBoxEncryptedImageData] =
    useState<string>("");
  const [openBoxDecryptedImageData, setOpenBoxDecryptedImageData] =
    useState<string>("");
  const [boxPublicKey, setBoxPublicKey] = useState<string>("");
  const [boxPrivateKey, setBoxPrivateKey] = useState<string>("");

  const [chaChaNonce, setChaChaNonce] = useState<string>("");
  const [chaChaKey, setChaChaKey] = useState<string>("");
  const [chaChaEncryptedImageData, setChaChaEncryptedImageData] =
    useState<string>("");
  const [chaChaDecryptedImageData, setChaChaDecryptedImageData] =
    useState<string>("");

  useEffect(() => {
    createOpenBoxKey();
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
      setImageUri(result.uri);
      setBase64ImageData(result.base64);
    }
  };

  const getImage = (base64ImageData: string): string => {
    return `data:image/jpeg;base64,${base64ImageData}`;
  };

  const createOpenBoxKey = async () => {
    console.log({ crypto_secretbox_KEYBYTES: sodium.crypto_generichash_BYTES });
    const key = await sodium.randombytes_buf(sodium.crypto_secretbox_KEYBYTES);
    setOpenBoxKey(sodium.to_base64(key));
  };

  const createChaChaKeys = async () => {
    const key = await sodium.crypto_aead_xchacha20poly1305_ietf_keygen();
    console.log(key);
    setChaChaKey(sodium.to_base64(key));
  };

  // encrypt
  const secretBoxEncryptBase64ImageData = async () => {
    const nonce = await sodium.randombytes_buf(
      sodium.crypto_secretbox_NONCEBYTES
    );
    const base64Nonce = sodium.to_base64(nonce);
    const encryptedImageData = sodium.crypto_secretbox_easy(
      base64ImageData,
      base64Nonce,
      openBoxKey
    );
    setOpenBoxNonce(base64Nonce);
    setOpenBoxEncryptedImageData(encryptedImageData);
    return encryptedImageData;
  };

  // decrypt
  const secretBoxDeecryptBase64ImageData = async () => {
    const decryptedImageData = sodium.crypto_secretbox_open_easy(
      openBoxEncryptedImageData,
      openBoxNonce,
      openBoxKey
    );
    setOpenBoxDecryptedImageData(decryptedImageData);
  };

  const chaChaEncryptBase64ImageData = async () => {
    const nonce = await sodium.randombytes_buf(
      sodium.crypto_secretbox_NONCEBYTES
    );
    const additionalData = "";
    const encryptedImageData =
      await sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
        base64ImageData,
        additionalData,
        null,
        nonce,
        chaChaKey
      );
    setChaChaNonce(sodium.to_base64(nonce));
    setChaChaEncryptedImageData(encryptedImageData);
  };

  const chaChaDecryptBase64ImageData = async () => {
    const additionalData = "";
    const nonce = sodium.from_base64(chaChaNonce);
    const decryptedImageData =
      await sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
        null,
        chaChaEncryptedImageData,
        additionalData,
        chaChaNonce,
        chaChaKey
      );
    setChaChaDecryptedImageData(decryptedImageData);
  };

  return (
    <View>
      <Text>Encrypt/Decrypt Image</Text>
      <Image
        source={{ uri: getImage(base64ImageData) }}
        style={{ width: 200, height: 200 }}
      />
      <Button onPress={pickImage}>Choose Image</Button>
      <Button onPress={chaChaEncryptBase64ImageData}>Encrypt Image</Button>
      <Button onPress={chaChaDecryptBase64ImageData}>Decrypt Image</Button>

      <Button onPress={pickImage}>Decrypted Image</Button>
      <Image
        source={{ uri: getImage(chaChaDecryptedImageData) }}
        style={{ width: 200, height: 200 }}
      />
    </View>
  );
}
