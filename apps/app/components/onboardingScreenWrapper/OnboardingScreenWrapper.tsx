import { useNavigation } from "@react-navigation/native";
import { CenterContent, IconButton, tw, View } from "@serenity-tools/ui";
import { KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type OnboardingBackButtonProps = {
  children: React.ReactNode;
};

export function OnboardingScreenWrapper({
  children,
}: OnboardingBackButtonProps) {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={tw`flex-auto`}>
      <KeyboardAvoidingView behavior="padding" style={tw`flex-auto`}>
        <CenterContent serenityBg>
          {navigation.canGoBack() ? (
            <View style={tw`absolute left-0 ios:left-4 top-0`}>
              <IconButton
                size="lg"
                name="double-arrow-left"
                color={"gray-500"}
                onPress={() => navigation.goBack()}
              />
            </View>
          ) : null}
          {children}
        </CenterContent>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
