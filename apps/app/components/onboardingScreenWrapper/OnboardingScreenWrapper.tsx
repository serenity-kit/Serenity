import { useNavigation } from "@react-navigation/native";
import {
  CenterContent,
  IconButton,
  tw,
  useIsEqualOrLargerThanBreakpoint,
  View,
} from "@serenity-tools/ui";
import { KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type OnboardingBackButtonProps = {
  children: React.ReactNode;
};

export function OnboardingScreenWrapper({
  children,
}: OnboardingBackButtonProps) {
  const navigation = useNavigation();
  const isEqualOrLargerThanXS = useIsEqualOrLargerThanBreakpoint("xs");

  return (
    <SafeAreaView style={tw`flex-auto`}>
      <KeyboardAvoidingView behavior="padding" style={tw`flex-auto`}>
        <CenterContent serenityBg>
          {navigation.canGoBack() ? (
            <View style={tw`absolute left-4 top-4`}>
              <IconButton
                size="lg"
                name="arrow-left-line"
                color={isEqualOrLargerThanXS ? "primary-300" : "gray-500"}
                onPress={() => navigation.goBack()}
                label="Go back"
                transparent={isEqualOrLargerThanXS}
              />
            </View>
          ) : null}
          {children}
        </CenterContent>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
