import { Text, View } from "@serenity-tools/ui";
import { useEffect, useState } from "react";
import sodium from "@serenity-tools/libsodium";

const signingKeyPair = {
  keyType: "ed25519",
  privateKey:
    "E7YwpvlfrtEMDiHRglSGl4sl3sxnkEzgMrS/1QngPwzBuwX43pBYTksvHfWCy33LXOkesy1N9N9uQ5oKBJXn3Q==",
  publicKey: "wbsF+N6QWE5LLx31gst9y1zpHrMtTfTfbkOaCgSV590=",
};

export default function TestEditorScreen() {
  const [data, setData] = useState({});

  useEffect(() => {
    async function run() {
      const randombytes_buf = await sodium.randombytes_buf(24);
      const crypto_sign_keypair = await sodium.crypto_sign_keypair();
      const crypto_sign_detached = await sodium.crypto_sign_detached(
        "Hello",
        signingKeyPair.privateKey
      );
      const key = await sodium.crypto_aead_xchacha20poly1305_ietf_keygen();
      const x = await sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
        "Hello",
        "test",
        null,
        randombytes_buf,
        key
      );
      console.log(x);

      setData({
        randombytes_buf,
        crypto_sign_keypair,
        crypto_sign_detached,
      });
    }

    run();
  }, []);

  return (
    <View>
      <Text>Libsodium Test Screen</Text>
      <Text>{JSON.stringify(data)}</Text>
    </View>
  );
}
