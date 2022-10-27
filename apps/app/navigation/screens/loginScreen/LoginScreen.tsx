import { useIsFocused } from "@react-navigation/native";
import {
  Box,
  Description,
  Heading,
  Link,
  Text,
  tw,
  View,
} from "@serenity-tools/ui";
import { LoginForm } from "../../../components/login/LoginForm";
import { OnboardingScreenWrapper } from "../../../components/onboardingScreenWrapper/OnboardingScreenWrapper";
import { RootStackScreenProps } from "../../../types/navigation";
import { navigateToNextAuthenticatedPage } from "../../../utils/authentication/loginHelper";

export default function LoginScreen(props: RootStackScreenProps<"Login">) {
  const onLoginSuccess = async () => {
    navigateToNextAuthenticatedPage({
      navigation: props.navigation,
      pendingWorkspaceInvitationId: null,
    });
  };
  const isFocused = useIsFocused();

  return (
    <OnboardingScreenWrapper>
      <Box plush>
        <View>
          <Heading lvl={1} center padded>
            Welcome back
          </Heading>
          <View>
            <Description variant="login" style={tw`text-center`}>
              Log in to your Serenity account
            </Description>
          </View>
        </View>
        <LoginForm onLoginSuccess={onLoginSuccess} isFocused={isFocused} />
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
