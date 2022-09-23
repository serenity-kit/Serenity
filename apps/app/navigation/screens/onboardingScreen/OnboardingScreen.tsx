import { CenterContent, tw, View } from "@serenity-tools/ui";
import { KeyboardAvoidingView, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CreateWorkspaceForm } from "../../../components/createWorkspaceForm/CreateWorkspaceForm";

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
        <CenterContent>
          <View style={tw`max-w-sm p-6`}>
            <CreateWorkspaceForm
              onWorkspaceStructureCreated={onWorkspaceStructureCreated}
            />
          </View>
        </CenterContent>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
