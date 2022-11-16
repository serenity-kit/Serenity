import { KeyboardAvoidingView, useWindowDimensions } from "react-native";

import { CenterContent, Link, Text, tw, View } from "@serenity-tools/ui";
import { SafeAreaView } from "react-native-safe-area-context";
import AccountMenu from "../../../components/accountMenu/AccountMenu";
import { RootStackScreenProps } from "../../../types/navigationProps";

export default function WorkspaceNotFoundScreen({
  navigation,
}: RootStackScreenProps<"NotFound">) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing

  return (
    <SafeAreaView style={tw`flex-auto`}>
      {/* flex needed for Menu-overlay positioning */}
      <View style={tw`flex items-start py-1.5 px-5 md:px-4`}>
        <AccountMenu
          openCreateWorkspace={() => {
            navigation.push("Onboarding");
          }}
          testID="workspace-not-found"
        />
      </View>
      <KeyboardAvoidingView behavior="padding" style={tw`flex-auto`}>
        <CenterContent testID="no-access-to-workspace-error">
          <Text style={tw`px-4`}>
            This workspace doesn't exist or you no longer have access.
          </Text>
          <Link style={tw`mt-2`} to={{ screen: "Root" }}>
            Go to home
          </Link>
        </CenterContent>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
