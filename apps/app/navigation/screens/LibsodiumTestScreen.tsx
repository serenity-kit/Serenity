import { Text, View } from "@serenity-tools/ui";
import { useEffect, useState } from "react";
import sodium from "@serenity-tools/libsodium";

const signingKeyPair = {
  keyType: "ed25519",
  privateKey:
    "E7YwpvlfrtEMDiHRglSGl4sl3sxnkEzgMrS_1QngPwzBuwX43pBYTksvHfWCy33LXOkesy1N9N9uQ5oKBJXn3Q",
  publicKey: "wbsF-N6QWE5LLx31gst9y1zpHrMtTfTfbkOaCgSV590",
};

const exitingCiphertext = "DtMWG6Jx9wAmLXh64enOwd6E7cFX";
const key = "eL4FdkhTmU2F56ySJKKH-2ZVrzdsIIbbmvyz_N3Swb0";
const nonce = "5GDx6cP2_uToVP-UKhddEmUelpyKTJLZ";

export default function PageScreen() {
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
      });
    }

    run();
  }, []);

  return (
    <View>
      <Text>Libsodium Test Screen</Text>
      {Object.keys(data).map((key) => (
        <View key={key}>
          <Text>
            {key}: {JSON.stringify(data[key], undefined, 2)}
          </Text>
        </View>
      ))}
    </View>
  );
}
