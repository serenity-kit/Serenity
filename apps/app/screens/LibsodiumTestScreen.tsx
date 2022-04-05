import { Text, View } from "@serenity-tools/ui";
import { useEffect, useState } from "react";
import sodium from "@serenity-tools/libsodium";

const signingKeyPair = {
  keyType: "ed25519",
  privateKey:
    "ReL7DknBDFcUwxBCZq6h4WN5afloIOkU0JGOi2IxxQsGL7NOP28f5sj/BMVisix3MxZhnDyI7mmTyGS+B1f1Lg==",
  publicKey: "Bi+zTj9vH+bI/wTFYrIsdzMWYZw8iO5pk8hkvgdX9S4=",
};

export default function TestEditorScreen() {
  const [data, setData] = useState({});

  useEffect(() => {
    async function run() {
      const randombytes_buf = await sodium.randombytes_buf(32);
      const crypto_sign_keypair = await sodium.crypto_sign_keypair();
      console.log(crypto_sign_keypair);
      try {
        const crypto_sign_detached = await sodium.crypto_sign_detached(
          "Hello",
          signingKeyPair.privateKey
        );
        console.log("crypto_sign_detached", crypto_sign_detached);
      } catch (err) {
        console.log(err);
      }

      setData({ randombytes_buf, crypto_sign_keypair });
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
