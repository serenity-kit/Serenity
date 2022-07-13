import React from "react";
import { Text, View, Box, tw, Link } from "@serenity-tools/ui";
import { RootStackScreenProps } from "../../types/navigation";
import RegisterForm from "../../components/register/RegisterForm";
import { KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
    <SafeAreaView style={tw`flex-auto`}>
      <KeyboardAvoidingView behavior="padding" style={tw`flex-auto`}>
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
            <View style={tw`text-center`}>
              <Text variant="xs" muted>
                Already have an account?
              </Text>
              <Link to={{ screen: "Login" }}>Login here</Link>
            </View>
          </Box>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
