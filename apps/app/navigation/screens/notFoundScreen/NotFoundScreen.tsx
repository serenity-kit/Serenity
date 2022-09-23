import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";

import { Text, View } from "@serenity-tools/ui";
import { RootStackScreenProps } from "../../../types/navigation";

export default function NotFoundScreen({
  navigation,
}: RootStackScreenProps<"NotFound">) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing

  return (
    <View style={styles.container}>
      <Text style={styles.title}>This screen doesn't exist.</Text>
      <TouchableOpacity
        onPress={() => navigation.replace("DevDashboard")}
        style={styles.link}
      >
        <Text style={styles.linkText}>Go to dashboard!</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: "#2e78b7",
  },
});
