import { Box, Link, Text, tw, View } from "@serenity-tools/ui";
import { LoginForm } from "../../components/login/LoginForm";
import { OnboardingScreenWrapper } from "../../components/onboardingScreenWrapper/OnboardingScreenWrapper";
import { RootStackScreenProps } from "../../types/navigation";
import { navigateToNextAuthenticatedPage } from "../../utils/authentication/loginHelper";

export default function LoginScreen(props: RootStackScreenProps<"Login">) {
  const onLoginSuccess = async () => {
    navigateToNextAuthenticatedPage({
      navigation: props.navigation,
      pendingWorkspaceInvitationId: null,
    });
  };

  return (
    <OnboardingScreenWrapper>
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
    </OnboardingScreenWrapper>
  );
}
