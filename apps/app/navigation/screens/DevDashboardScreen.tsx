import { Button, Link, Text, tw, View } from "@serenity-tools/ui";
import { useWindowDimensions } from "react-native";

export default function DevDashboardScreen(props) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing

  return (
    <View style={tw`mt-20`}>
      <Text>Dev Dashboard Screen</Text>
      <Link to={{ screen: "DesignSystem" }}>Design System</Link>
      <Link to={{ screen: "EncryptDecryptImageTest" }}>
        Encrypt / Decrypt Image
      </Link>
      <Button
        onPress={() => {
          localStorage.setItem("deviceSigningPublicKey", `TODO+jane`);
          console.log(props);
          props.navigation.navigate("Root");
        }}
      >
        Mock Mode Login
      </Button>
    </View>
  );
}
