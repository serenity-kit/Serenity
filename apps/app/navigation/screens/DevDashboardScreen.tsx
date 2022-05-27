import { Button, Link, Pressable, Text, tw, View } from "@serenity-tools/ui";
import { Platform, useWindowDimensions } from "react-native";
import { registerInitialize, OpaqueBridge } from "@serenity-tools/opaque-se";

export default function DevDashboardScreen(props) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing

  return (
    <View style={tw`mt-20`}>
      <Text>Dev Dashboard Screen</Text>
      <Link to={{ screen: "DesignSystem" }}>Design System</Link>
      <Link to={{ screen: "Root" }}>Root</Link>
      <Link to={{ screen: "EncryptDecryptImageTest" }}>
        Encrypt / Decrypt Image
      </Link>
      <Button
        onPress={() => {
          if (Platform.OS === "web") {
            localStorage.setItem("deviceSigningPublicKey", `TODO+jane`);
          }
          props.navigation.navigate("Root");
        }}
      >
        Mock Mode Login
      </Button>
      <OpaqueBridge />
      <Pressable
        onPress={async () => {
          const request = await registerInitialize("weee");
          alert("o");
          console.log(request);
        }}
      >
        <Text>test</Text>
      </Pressable>
    </View>
  );
}
