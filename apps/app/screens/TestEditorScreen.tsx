import { Text, View } from "@serenity-tools/ui";
import { useEffect, useState } from "react";
import Sodium from "react-native-sodium-expo-plugin";

export default function TestEditorScreen() {
  const [key, setKey] = useState("");
  const [sodiumVersion, setSodiumVersion] = useState("");

  useEffect(() => {
    async function run() {
      const sodiumVersion = await Sodium.sodium_version_string();
      const newKey = await Sodium.crypto_secretbox_keygen();
      setKey(newKey);
      setSodiumVersion(sodiumVersion);
    }

    run();
  }, []);

  return (
    <View>
      <Text>Sodium: {sodiumVersion}</Text>
      <Text>Sodium generated key: {key}</Text>
      <Text>PLACEHOLDER</Text>
    </View>
  );
}
