import { ScrollSafeAreaView, ScrollView, Text, View } from "@serenity-tools/ui";
import { useEffect, useState } from "react";
import sodium from "@serenity-tools/libsodium";
import { useWindowDimensions } from "react-native";
import { kdfDeriveFromKey } from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";

const signingKeyPair = {
  keyType: "ed25519",
  privateKey:
    "E7YwpvlfrtEMDiHRglSGl4sl3sxnkEzgMrS_1QngPwzBuwX43pBYTksvHfWCy33LXOkesy1N9N9uQ5oKBJXn3Q",
  publicKey: "wbsF-N6QWE5LLx31gst9y1zpHrMtTfTfbkOaCgSV590",
};

const exitingCiphertext = "DtMWG6Jx9wAmLXh64enOwd6E7cFX";
const key = "eL4FdkhTmU2F56ySJKKH-2ZVrzdsIIbbmvyz_N3Swb0";
const nonce = "5GDx6cP2_uToVP-UKhddEmUelpyKTJLZ";

const kdfKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";

export default function PageScreen() {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const [data, setData] = useState({});

  useEffect(() => {
    async function run() {
      const randombytes_buf = await sodium.randombytes_buf(24);
      const crypto_sign_detached = await sodium.crypto_sign_detached(
        "Hello",
        signingKeyPair.privateKey
      );
      const crypto_sign_verify_detached =
        await sodium.crypto_sign_verify_detached(
          crypto_sign_detached,
          "Hello",
          signingKeyPair.publicKey
        );

      const crypto_sign_keypair = await sodium.crypto_sign_keypair();
      const crypto_sign_detached2 = await sodium.crypto_sign_detached(
        "Hello",
        crypto_sign_keypair.privateKey
      );
      const crypto_sign_verify_detached2 =
        await sodium.crypto_sign_verify_detached(
          crypto_sign_detached2,
          "Hello",
          crypto_sign_keypair.publicKey
        );

      const tmpKey = await sodium.crypto_aead_xchacha20poly1305_ietf_keygen();
      const ciphertext =
        await sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
          "Hello",
          "test",
          null,
          randombytes_buf,
          tmpKey
        );

      const message = await sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
        null,
        ciphertext,
        "test",
        randombytes_buf,
        tmpKey
      );
      const messageFromExistingCiphertext =
        await sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
          null,
          exitingCiphertext,
          "test",
          nonce,
          key
        );

      const secretBoxNonce = await sodium.randombytes_buf(
        sodium.crypto_secretbox_NONCEBYTES
      );
      const secretBoxKey = await sodium.randombytes_buf(
        sodium.crypto_secretbox_KEYBYTES
      );
      console.log(secretBoxNonce);
      console.log(secretBoxKey);
      const ciphertextSecretBox = await sodium.crypto_secretbox_easy(
        sodium.to_base64("Hello World"),
        secretBoxNonce,
        secretBoxKey
      );

      console.log("ciphertextSecretBox", ciphertextSecretBox);

      const decryptedSecretBox = await sodium.crypto_secretbox_open_easy(
        ciphertextSecretBox,
        secretBoxNonce,
        secretBoxKey
      );

      console.log(
        "decryptedSecretBox",
        sodium.from_base64_to_string(decryptedSecretBox)
      );

      const kdfDerivedKey = await kdfDeriveFromKey({
        key: kdfKey,
        context: "serenity",
        subkeyId: 5200022,
      });

      setData({
        randombytes_buf,
        crypto_sign_keypair,
        crypto_sign_detached,
        crypto_sign_verify_detached,
        crypto_sign_detached2,
        crypto_sign_verify_detached2,
        ciphertext,
        message: sodium.from_base64_to_string(message),
        messageFromExistingCiphertext: sodium.from_base64_to_string(
          messageFromExistingCiphertext
        ),
        kdfDerivedKey,
        kdfDerivedKeyIsCorrect:
          kdfDerivedKey.key === "R2ycEA9jEapG3MEAM3VEgYsKgiwkMm_JuwqbtfE13F4",
      });
    }

    run();
  }, []);

  return (
    <ScrollView>
      <Text>Libsodium Test Screen</Text>
      {Object.keys(data).map((key) => (
        <View key={key}>
          <Text>
            {key}: {JSON.stringify(data[key], undefined, 2)}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
