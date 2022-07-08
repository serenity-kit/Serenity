import { View, Text } from "@serenity-tools/ui";
import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { useWorkspaceId } from "../../context/WorkspaceIdContext";

export default function NoPageExistsScreen(props) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const workspaceId = useWorkspaceId();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>This page doesn't exist.</Text>
      <Text>It has been removed or you no longer have access.</Text>
      <TouchableOpacity
        onPress={() => {
          props.navigation.replace("Workspace", {
            screen: "WorkspaceRoot",
            workspaceId,
          });
        }}
        style={styles.link}
      >
        <Text style={styles.linkText}>Go to workspace!</Text>
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
