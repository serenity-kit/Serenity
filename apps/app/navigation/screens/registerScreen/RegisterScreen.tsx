import { Box, Icon, Link, Text, tw, View } from "@serenity-tools/ui";
import { OnboardingScreenWrapper } from "../../../components/onboardingScreenWrapper/OnboardingScreenWrapper";
import RegisterForm from "../../../components/register/RegisterForm";
import { RootStackScreenProps } from "../../../types/navigation";

export default function RegisterScreen(
  props: RootStackScreenProps<"Register">
) {
  const onRegisterSuccess = (username: string, verificationCode?: string) => {
    props.navigation.push("RegistrationVerification", {
      username,
      verification: verificationCode,
    });
  };

  return (
    <OnboardingScreenWrapper>
      <Box plush>
        <View>
          <Text variant="lg" bold style={tw`text-center`}>
            Create your account
          </Text>
          <Text muted style={tw`text-center`}>
            Sign up and start your free trial!
            {"\n"}
            No credit card required.
          </Text>
        </View>
        <RegisterForm onRegisterSuccess={onRegisterSuccess} />
        <View style={tw`text-center`}>
          <Text variant="xs" muted>
            Already have an account?
          </Text>
          <Link to={{ screen: "Login" }}>Login here</Link>
        </View>
      </Box>
      <View style={tw`absolute left-0 ios:left-4 bottom-0`}>
        <Link to={{ screen: "DevDashboard" }} style={tw`p-4`}>
          <Icon name="dashboard-line" color={"gray-500"} />
        </Link>
      </View>
    </OnboardingScreenWrapper>
  );
}
