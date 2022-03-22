import { Link, Text, tw, View } from "@serenity-tools/ui";

export default function DashboardScreen() {
  return (
    <View style={tw`mt-20`}>
      <Text>Dashboard Screen</Text>
      <Link to={{ screen: "editor" }}>Link to Editor</Link>
    </View>
  );
}
