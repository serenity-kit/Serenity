import { Text, View } from "@serenity-tools/ui";
import { Link } from "@react-navigation/native";

export default function DashboardScreen() {
  return (
    <View>
      <Text>Dashboard Screen</Text>
      <Link to={{ screen: "editor" }}>Link to Editor</Link>
    </View>
  );
}
