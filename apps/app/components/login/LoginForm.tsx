import React, { useEffect, useState } from "react";
import { Button, LabeledInput, Text, View, Link, tw } from "@serenity-tools/ui";
import { useWindowDimensions } from "react-native";
import { VStack } from "native-base";
import {
  useStartLoginMutation,
  useFinishLoginMutation,
  MainDeviceQuery,
  MainDeviceDocument,
} from "../../generated/graphql";
import { useAuthentication } from "../../context/AuthenticationContext";
import { login, fetchMainDevice } from "../../utils/login/loginHelper";
import { useClient } from "urql";

type Props = {
  defaultEmail?: string;
  onLoginSuccess: () => void;
  onLoginFail?: () => void;
  onEmailChangeText?: (username: string) => void;
  onFormFilled?: () => void;
};

export function LoginForm(props: Props) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const [username, _setUsername] = useState("");
  const [password, _setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [gqlErrorMessage, setGqlErrorMessage] = useState("");

  const { updateAuthentication } = useAuthentication();
  const [, startLoginMutation] = useStartLoginMutation();
  const [, finishLoginMutation] = useFinishLoginMutation();
  const urqlClient = useClient();

  const onFormFilled = (username: string, password: string) => {
    if (props.onFormFilled) {
      props.onFormFilled();
    }
  };

  const setUsername = (username: string) => {
    _setUsername(username);
    if (props.onEmailChangeText) {
      props.onEmailChangeText(username);
    }
    onFormFilled(username, password);
  };

  const setPassword = (password: string) => {
    _setPassword(password);
  };

  const onLoginPress = async () => {
    try {
      setGqlErrorMessage("");
      setIsLoggingIn(true);
      const loginResult = await login({
        username,
        password,
        startLoginMutation,
        finishLoginMutation,
        updateAuthentication,
      });
      await fetchMainDevice({ urqlClient, exportKey: loginResult.exportKey });
      // reset the password in case the user ends up on this screen again
      setPassword("");
      setUsername("");
      setIsLoggingIn(false);
      props.onLoginSuccess();
    } catch (error) {
      console.error(error);
      setGqlErrorMessage("Failed to login.");
      setIsLoggingIn(false);
      if (props.onLoginFail) {
        props.onLoginFail();
      }
    }
  };

  return (
    <VStack space="5">
      {gqlErrorMessage !== "" && (
        <View>
          <Text>{gqlErrorMessage}</Text>
        </View>
      )}
      <LabeledInput
        label={"Email"}
        keyboardType="email-address"
        value={username}
        onChangeText={(username: string) => {
          setUsername(username);
        }}
        placeholder="Enter your email …"
        autoCapitalize="none"
      />

      <LabeledInput
        label={"Password"}
        secureTextEntry
        value={password}
        onChangeText={(password: string) => {
          setPassword(password);
        }}
        placeholder="Enter your password …"
      />

      <Button onPress={onLoginPress} size="large" disabled={isLoggingIn}>
        Log in
      </Button>
      <View style={tw`text-center`}>
        <Text variant="xs" muted>
          Don't have an account?{" "}
        </Text>
        <Text variant="xs">
          <Link to={{ screen: "Register" }}>Register here</Link>
        </Text>
      </View>
    </VStack>
  );
}
