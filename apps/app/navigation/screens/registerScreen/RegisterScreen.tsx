import { useIsFocused } from "@react-navigation/native";
import {
  Box,
  Description,
  Heading,
  Icon,
  Link,
  Text,
  tw,
  View,
} from "@serenity-tools/ui";
import { OnboardingScreenWrapper } from "../../../components/onboardingScreenWrapper/OnboardingScreenWrapper";
import RegisterForm from "../../../components/register/RegisterForm";
import { RootStackScreenProps } from "../../../types/navigationProps";

export default function RegisterScreen(
  props: RootStackScreenProps<"Register">
) {
  const isFocused = useIsFocused();
  const onRegisterSuccess = (username: string) => {
    props.navigation.push("RegistrationVerification", {
      username,
    });
  };

  return (
    <OnboardingScreenWrapper>
      <Box plush>
        <View>
          <Heading lvl={1} center padded>
            Create your account
          </Heading>
          <Description variant="login" style={tw`text-center`}>
            Sign up and start your free trial!
            {"\n"}
            No credit card required.
          </Description>
        </View>
        <RegisterForm
          onRegisterSuccess={onRegisterSuccess}
          isFocused={isFocused}
        />
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
