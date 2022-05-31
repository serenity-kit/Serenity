import React, { useState } from "react";
import {
  Text,
  View,
  Box,
  Button,
  tw,
  Link,
  LabeledInput,
} from "@serenity-tools/ui";
import {
  useInitializeLoginMutation,
  useFinalizeLoginMutation,
} from "../../generated/graphql";
import { useWindowDimensions } from "react-native";
import { RootStackScreenProps } from "../../types";
import { useAuthentication } from "../../context/AuthenticationContext";
import { startLogin, finishLogin } from "@serenity-tools/opaque-se";

export default function LoginScreen(props: RootStackScreenProps<"Login">) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [didLoginSucceed, setDidLoginSucceed] = useState(false);
  const [, initializeLoginMutation] = useInitializeLoginMutation();
  const [, finalizeLoginMutation] = useFinalizeLoginMutation();
  const [hasGqlError, setHasGqlError] = useState(false);
  const [gqlErrorMessage, setGqlErrorMessage] = useState("");
  const { updateAuthentication } = useAuthentication();

  const onLoginPress = async () => {
    setDidLoginSucceed(false);
    setHasGqlError(false);
    setGqlErrorMessage("");
    try {
      const message = await startLogin(password);
      const mutationResult = await initializeLoginMutation({
        input: {
          username: username,
          challenge: message,
        },
      });
      // check for an error
      if (mutationResult.data && mutationResult.data.initializeLogin) {
        const challengeResponse =
          mutationResult.data.initializeLogin.challengeResponse;

        const result = await finishLogin(challengeResponse);
        console.log("sessionKey", result.sessionKey);
        console.log("exportKey", result.exportKey);

        const finalizeLoginResult = await finalizeLoginMutation({
          input: { username, message: result.response },
        });

        if (
          finalizeLoginResult.data &&
          finalizeLoginResult.data.finalizeLogin
        ) {
          setDidLoginSucceed(true);
          updateAuthentication(`TODO+${username}`);
          props.navigation.navigate("Root");
        } else if (finalizeLoginResult.error) {
          throw Error("Failed to Login");
        }
      } else if (mutationResult.error) {
        throw Error("Failed to Login");
      }
    } catch (error) {
      console.log("error getting server challenge");
      console.log(error);
      setHasGqlError(true);
      setGqlErrorMessage(error.toString());
    }
  };

  return (
    <View
      style={tw`bg-white xs:bg-primary-900 justify-center items-center flex-auto`}
    >
      {/* TODO use this as classes or default/variant ? */}
      <Box style={tw`max-w-md w-full`}>
        <View>
          <Text variant="large" bold style={tw`text-center`}>
            Welcome back!
          </Text>
          <Text muted style={tw`text-center`}>
            Log in to your Serenity Account
          </Text>
        </View>

        {hasGqlError && (
          <View>
            <Text>{gqlErrorMessage}</Text>
          </View>
        )}

        {didLoginSucceed && (
          <View>
            <Text>Login Succeeded</Text>
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

        <Button onPress={onLoginPress}>Log in</Button>
        <View style={tw`text-center`}>
          <Text variant="xs" muted>
            Don't have an account?{" "}
          </Text>
          <Text variant="xs">
            <Link to={{ screen: "Register" }}>Register here</Link>
          </Text>
        </View>
      </Box>
    </View>
  );
}
