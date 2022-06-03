import React, { useState } from "react";
import { View, tw, Box } from "@serenity-tools/ui";
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
        <LoginForm onLoginSuccess={onLoginSuccess} />
      </Box>
    </View>
  );
}
