import { Text, View } from "@serenity-tools/ui";
import { useEffect } from "react";
import { RootStackScreenProps } from "../../types";

export default function RootScreen(props: RootStackScreenProps<"Root">) {
  useEffect(() => {
    const deviceSigningPublicKey = localStorage.getItem(
      "deviceSigningPublicKey"
    );

    if (deviceSigningPublicKey) {
      // query first document on first workspace and go there
      props.navigation.navigate("Workspace", {
        workspaceId: "dummy",
        screen: "Dashboard",
      });
    } else {
      props.navigation.navigate("Register");
    }
  }, []);
  return (
    <View>
      <Text>Splash Screen</Text>
    </View>
  );
}
