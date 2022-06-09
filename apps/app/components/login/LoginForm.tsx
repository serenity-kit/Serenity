import React, { useState } from "react";
import { Button, LabeledInput, Text, View, Link, tw } from "@serenity-tools/ui";
import {
  useStartLoginMutation,
  useFinishLoginMutation,
} from "../../generated/graphql";
import { useAuthentication } from "../../context/AuthenticationContext";
import { startLogin, finishLogin } from "@serenity-tools/opaque";
import { useWindowDimensions } from "react-native";
import { VStack } from "native-base";

type Props = {
  defaultEmail?: string;
  onLoginSuccess?: () => void;
  onLoginFail?: () => void;
  onEmailChangeText?: (username: string) => void;
  onFormFilled?: () => void;
};

export function LoginForm(props: Props) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const [username, _setUsername] = useState("");
  const [password, _setPassword] = useState("");

  const [didLoginSucceed, setDidLoginSucceed] = useState(false);
  const [, startLoginMutation] = useStartLoginMutation();
  const [, finishLoginMutation] = useFinishLoginMutation();

  const [gqlErrorMessage, setGqlErrorMessage] = useState("");
  const { updateAuthentication } = useAuthentication();

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
    setDidLoginSucceed(false);
    setGqlErrorMessage("");
    try {
      const message = await startLogin(password);
      const mutationResult = await startLoginMutation({
        input: {
          username: username,
          challenge: message,
        },
      });
      // check for an error
      if (mutationResult.data?.startLogin) {
        const result = await finishLogin(
          mutationResult.data.startLogin.challengeResponse
        );
        console.log("sessionKey", result.sessionKey);
        console.log("exportKey", result.exportKey);

        const finalizeLoginResult = await finishLoginMutation({
          input: {
            loginId: mutationResult.data.startLogin.loginId,
            message: result.response,
          },
        });

        if (finalizeLoginResult.data?.finishLogin) {
          setDidLoginSucceed(true);
          // reset the password in case the user ends up on this screen again
          setPassword("");
          setUsername("");
          updateAuthentication(`TODO+${username}`);
          if (props.onLoginSuccess) {
            props.onLoginSuccess();
          }
        } else if (finalizeLoginResult.error) {
          if (props.onLoginFail) {
            props.onLoginFail();
          }
        }
      } else if (mutationResult.error) {
        if (props.onLoginFail) {
          props.onLoginFail();
        }
      }
    } catch (error) {
      console.log("error getting server challenge");
      console.log(error);
      setGqlErrorMessage(error.toString());
    }
  };

  return (
    <VStack space="5">
      {gqlErrorMessage !== "" && (
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

      <Button onPress={onLoginPress} size="large">
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
