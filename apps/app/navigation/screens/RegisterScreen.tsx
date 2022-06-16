import React from "react";
import { Text, View, Box, tw } from "@serenity-tools/ui";
import { RootStackScreenProps } from "../../types";
import RegisterForm from "../../components/register/RegisterForm";

export default function RegisterScreen(
  props: RootStackScreenProps<"Register">
) {
  const onRegisterSuccess = (username, verificationCode) => {
    props.navigation.push("RegistrationVerification", {
      username,
      verification: verificationCode,
    });
  };

  return (
    <View
      style={tw`bg-white xs:bg-primary-900 justify-center items-center flex-auto`}
    >
      <Box>
        <View>
          <Text variant="large" bold style={tw`text-center`}>
            Create your Account
          </Text>
          <Text muted style={tw`text-center`}>
            Sign up and start your free trial!
            {"\n"}
            No credit card required.
          </Text>
        </View>
        <RegisterForm onRegisterSuccess={onRegisterSuccess} />
      </Box>
    </View>
  );
}
