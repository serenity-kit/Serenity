import React from "react";
import { View, tw, Box, Text } from "@serenity-tools/ui";
import { RootStackScreenProps } from "../../types";
import { LoginForm } from "../../components/login/LoginForm";

export default function LoginScreen(props: RootStackScreenProps<"Login">) {
  const onLoginSuccess = () => {
    props.navigation.navigate("Root");
  };
  return (
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
        <LoginForm onLoginSuccess={onLoginSuccess} />
      </Box>
    </View>
  );
}
