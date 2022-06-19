import React from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { tw, View } from "@serenity-tools/ui";
import { CreateWorkspaceForm } from "../../components/createWorkspaceForm/CreateWorkspaceForm";

export default function OnboardingScreen({ navigation }) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing

  const onWorkspaceCreated = (workspace: { id: string }) => {
    navigation.navigate("Workspace", {
      workspaceId: workspace.id,
      screen: "Dashboard",
    });
  };

  return (
    <View style={styles.container}>
      <View style={tw`max-w-sm`}>
        <CreateWorkspaceForm onWorkspaceCreated={onWorkspaceCreated} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
