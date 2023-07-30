import { kdfDeriveFromKey } from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";
import { ScrollView, Text, View } from "@serenity-tools/ui";
import { useEffect, useState } from "react";
import { useWindowDimensions } from "react-native";
import sodium from "react-native-libsodium";
import { RootStackScreenProps } from "../../../types/navigationProps";

const signingKeyPair = {
  keyType: "ed25519",
  privateKey:
    "E7YwpvlfrtEMDiHRglSGl4sl3sxnkEzgMrS_1QngPwzBuwX43pBYTksvHfWCy33LXOkesy1N9N9uQ5oKBJXn3Q",
  publicKey: "wbsF-N6QWE5LLx31gst9y1zpHrMtTfTfbkOaCgSV590",
};

const kdfKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";

export default function LibsodiumTestScreen(
  props: RootStackScreenProps<"TestLibsodium">
) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const [data, setData] = useState({});

  useEffect(() => {
    async function run() {
      const randombytes_buf = sodium.randombytes_buf(24);
      const crypto_sign_detached = sodium.crypto_sign_detached(
        "Hello",
        sodium.from_base64(signingKeyPair.privateKey)
      );
      const crypto_sign_verify_detached = sodium.crypto_sign_verify_detached(
        crypto_sign_detached,
        "Hello",
        sodium.from_base64(signingKeyPair.publicKey)
      );

      const crypto_sign_keypair = sodium.crypto_sign_keypair();
      const crypto_sign_detached2 = sodium.crypto_sign_detached(
        "Hello",
        crypto_sign_keypair.privateKey
      );
      const crypto_sign_verify_detached2 = sodium.crypto_sign_verify_detached(
        crypto_sign_detached2,
        "Hello",
        crypto_sign_keypair.publicKey
      );

      const tmpKey = sodium.crypto_aead_xchacha20poly1305_ietf_keygen();
      const ciphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
        "Hello",
        "test",
        null,
        randombytes_buf,
        tmpKey
      );

      console.log("tmpKey:", sodium.to_base64(tmpKey));
      console.log("nonce:", sodium.to_base64(randombytes_buf));

      const message = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
        null,
        ciphertext,
        "test",
        randombytes_buf,
        tmpKey
      );

      const secretBoxNonce = sodium.randombytes_buf(
        sodium.crypto_secretbox_NONCEBYTES
      );
      const secretBoxKey = sodium.randombytes_buf(
        sodium.crypto_secretbox_KEYBYTES
      );
      console.log(secretBoxNonce);
      console.log(secretBoxKey);
      const ciphertextSecretBox = sodium.crypto_secretbox_easy(
        "Hello World",
        secretBoxNonce,
        secretBoxKey
      );

      console.log("ciphertextSecretBox", ciphertextSecretBox);

      const decryptedSecretBox = sodium.crypto_secretbox_open_easy(
        ciphertextSecretBox,
        secretBoxNonce,
        secretBoxKey
      );

      console.log("decryptedSecretBox", sodium.to_string(decryptedSecretBox));

      const kdfDerivedKey = kdfDeriveFromKey({
        key: kdfKey,
        context: "doctitle",
        subkeyId: 5200022,
      });

      const generatedKdfKey = sodium.crypto_kdf_keygen();

      setData({
        randombytes_buf: sodium.to_base64(randombytes_buf),
        crypto_sign_keypair_public_key: sodium.to_base64(
          crypto_sign_keypair.publicKey
        ),
        crypto_sign_detached: sodium.to_base64(crypto_sign_detached),
        crypto_sign_verify_detached,
        crypto_sign_detached2: sodium.to_base64(crypto_sign_detached2),
        crypto_sign_verify_detached2,
        ciphertext: sodium.to_base64(ciphertext),
        message: sodium.to_string(message),
        kdfDerivedKey: sodium.to_base64(kdfDerivedKey.key),
        kdfDerivedKeyIsCorrect:
          kdfDerivedKey.key === "R2ycEA9jEapG3MEAM3VEgYsKgiwkMm_JuwqbtfE13F4",
        generatedKdfKey: sodium.to_base64(generatedKdfKey),
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
