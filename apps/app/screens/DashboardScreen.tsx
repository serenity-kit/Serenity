import { Link, Text, tw, View } from "@serenity-tools/ui";

export default function DashboardScreen() {
  return (
    <View style={tw`mt-20`}>
      <Text>Dashboard Screen</Text>
      <Link to={{ screen: "design-system" }}>Design System</Link>
      <Link to={{ screen: "register" }}>Registration</Link>
      <Link to={{ screen: "login" }}>Login</Link>
      <Link to={{ screen: "editor" }}>Editor</Link>
      <Link to={{ screen: "test-editor" }}>Test-Editor</Link>
      <Link to={{ screen: "test-libsodium" }}>Libsodium Test Screen</Link>
    </View>
  );
}
