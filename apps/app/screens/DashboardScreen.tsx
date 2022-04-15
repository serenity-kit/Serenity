import { Link, Text, tw, View } from "@serenity-tools/ui";

export default function DashboardScreen() {
  return (
    <View style={tw`mt-20`}>
      <Text>Dashboard Screen</Text>
      <Link to={{ screen: "design-system" }}>Design System</Link>
      <Link to={{ screen: "editor" }}>Link to Editor</Link>
      <Link to={{ screen: "test-editor" }}>Link to Test-Editor</Link>
      <Link to={{ screen: "test-libsodium" }}>
        Link to Libsodium Test Screen
      </Link>
    </View>
  );
}
