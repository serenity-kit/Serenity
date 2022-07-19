import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";

import { Text, View } from "@serenity-tools/ui";
import { RootStackScreenProps } from "../../types/navigation";
import { removeLastUsedWorkspaceId } from "../../utils/lastUsedWorkspaceAndDocumentStore/lastUsedWorkspaceAndDocumentStore";

export default function WorkspaceNotFoundScreen({
  navigation,
}: RootStackScreenProps<"NotFound">) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing

  const removeLastUsedWorkspaceIdAndNavigateToRoot = async () => {
    await removeLastUsedWorkspaceId();
    navigation.replace("Root");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        This workspace doesn't exist or you no longer have access.
      </Text>
      <TouchableOpacity
        onPress={removeLastUsedWorkspaceIdAndNavigateToRoot}
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
