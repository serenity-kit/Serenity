import { KeyboardAvoidingView, useWindowDimensions } from "react-native";

import { CenterContent, Link, Text, tw, View } from "@serenity-tools/ui";
import { SafeAreaView } from "react-native-safe-area-context";
import AccountMenu from "../../../components/accountMenu/AccountMenu";
import { RootStackScreenProps } from "../../../types/navigation";

export default function WorkspaceNotFoundScreen({}: RootStackScreenProps<"NotFound">) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing

  return (
    <SafeAreaView style={tw`flex-auto`}>
      <View style={tw`py-1.5 px-5 md:px-4`}>
        <AccountMenu showCreateWorkspaceModal={() => undefined} />
      </View>
      <KeyboardAvoidingView behavior="padding" style={tw`flex-auto`}>
        <CenterContent>
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
