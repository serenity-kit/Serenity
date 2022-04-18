import { Link, Text, tw, View } from "@serenity-tools/ui";

export default function DevDashboardScreen() {
  return (
    <View style={tw`mt-20`}>
      <Text>Dev Dashboard Screen</Text>
      <Link to={{ screen: "DesignSystem" }}>Design System</Link>
      <Link to={{ screen: "Register" }}>Registration</Link>
      <Link to={{ screen: "Login" }}>Login</Link>
      <Link to={{ screen: "App", params: { screen: "Editor" } }}>Editor</Link>
      <Link to={{ screen: "App", params: { screen: "TestEditor" } }}>
        Sync-Test-Editor
      </Link>
      <Link to={{ screen: "App", params: { screen: "TestLibsodium" } }}>
        Libsodium Test Screen
      </Link>
    </View>
  );
}
