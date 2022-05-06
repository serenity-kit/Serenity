import { StyleSheet } from "react-native";

import { Text, View } from "@serenity-tools/ui";

export default function NoWorkspaceScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        No workspace available. TODO (link to create one)
      </Text>
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
});
