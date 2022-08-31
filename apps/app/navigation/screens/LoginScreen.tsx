import React from "react";
import { View, tw, Box, Text, Link, CenterContent } from "@serenity-tools/ui";
import { RootStackScreenProps } from "../../types/navigation";
import { LoginForm } from "../../components/login/LoginForm";
import { navigateToNextAuthenticatedPage } from "../../utils/authentication/loginHelper";
import { KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen(props: RootStackScreenProps<"Login">) {
  const onLoginSuccess = async () => {
    navigateToNextAuthenticatedPage({
      navigation: props.navigation,
      pendingWorkspaceInvitationId: null,
    });
  };

  return (
    <SafeAreaView style={tw`flex-auto`}>
      <KeyboardAvoidingView behavior="padding" style={tw`flex-auto`}>
        <CenterContent serenityBg>
          <Box plush>
            <View>
              <Text variant="lg" bold style={tw`text-center`}>
                Welcome back
              </Text>
              <View>
                <Text muted style={tw`text-center`}>
                  Log in to your Serenity Account
                </Text>
              </View>
            </View>
            <LoginForm onLoginSuccess={onLoginSuccess} />
            <View style={tw`text-center`}>
              <Text variant="xs" muted>
                Don't have an account?
              </Text>
              <Text variant="xs">
                <Link to={{ screen: "Register" }}>Register here</Link>
              </Text>
            </View>
          </Box>
        </CenterContent>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
