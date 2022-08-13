import React, { useEffect } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { tw, View } from "@serenity-tools/ui";
import { CreateWorkspaceForm } from "../../components/createWorkspaceForm/CreateWorkspaceForm";
import { KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OnboardingScreen({ navigation }) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing

  const onWorkspaceStructureCreated = ({ workspace, folder, document }) => {
    navigation.navigate("Workspace", {
      workspaceId: workspace.id,
      screen: "Page",
      params: {
        pageId: document.id,
      },
    });
  };

  return (
    <SafeAreaView style={tw`flex-auto`}>
      <KeyboardAvoidingView behavior="padding" style={tw`flex-auto`}>
        <View style={tw`flex-center-center`}>
          <View style={tw`max-w-sm p-6`}>
            <CreateWorkspaceForm
              onWorkspaceStructureCreated={onWorkspaceStructureCreated}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
