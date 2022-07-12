import React from "react";
import { View, tw, Box, Text } from "@serenity-tools/ui";
import { RootStackScreenProps } from "../../types/navigation";
import { LoginForm } from "../../components/login/LoginForm";
import { navigateToNextAuthenticatedPage } from "../../utils/authentication/loginHelper";
import { KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { roundToNearestMinutes } from "date-fns";

export default function LoginScreen(props: RootStackScreenProps<"Login">) {
  const switchToRegisterForm = () => {
    props.navigation.navigate("Register");
  };

  const onLoginSuccess = (pendingWorkspaceInvitationId) => {
    navigateToNextAuthenticatedPage({
      navigation: props.navigation,
      pendingWorkspaceInvitationId,
    });
  };
  return (
    <SafeAreaView style={tw`flex-auto`}>
      <KeyboardAvoidingView behavior="padding" style={tw`flex-auto`}>
        <View
          style={tw`bg-white xs:bg-primary-900 justify-center items-center flex-auto`}
        >
          <Box>
            <View>
              <Text variant="large" bold style={tw`text-center`}>
                Welcome back
              </Text>
              <View>
                <Text muted style={tw`text-center`}>
                  Log in to your Serenity Account
                </Text>
              </View>
            </View>
            <LoginForm
              onRegisterPress={switchToRegisterForm}
              onLoginSuccess={onLoginSuccess}
            />
          </Box>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
