import React, { useState } from "react";
import { Button, LabeledInput, Text, View, Link, tw } from "@serenity-tools/ui";
import {
  useStartLoginMutation,
  useFinishLoginMutation,
  useMainDeviceQuery,
} from "../../generated/graphql";
import { useAuthentication } from "../../context/AuthenticationContext";
import { startLogin, finishLogin } from "@serenity-tools/opaque";
import { useWindowDimensions } from "react-native";
import { VStack } from "native-base";
import * as sodium from "@serenity-tools/libsodium";

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

  const login = async (username: string, password: string) => {
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

        const finishLoginResult = await finishLoginMutation({
          input: {
            loginId: mutationResult.data.startLogin.loginId,
            message: result.response,
          },
        });

        if (finishLoginResult.data?.finishLogin) {
          setDidLoginSucceed(true);
          // reset the password in case the user ends up on this screen again
          setPassword("");
          setUsername("");
          updateAuthentication(
            finishLoginResult.data.finishLogin.mainDeviceSigningPublicKey
          );
          return result;
        } else if (finishLoginResult.error) {
          return;
        }
      } else if (mutationResult.error) {
        return;
      }
    } catch (error) {
      console.log("error getting server challenge");
      console.log(error);
      setGqlErrorMessage(error.toString());
      return;
    }
  };

  const fetchMainDevice = async (exportKey: string) => {
    const [mainDeviceResult] = useMainDeviceQuery();
    if (mainDeviceResult.data?.mainDevice) {
      const mainDevice = mainDeviceResult.data.mainDevice;
      console.log({ mainDevice });
      // mainDevice will include a ciphertext which can be decrypted
      // using the exportKey we got during Login
      const decryptedCiphertextBase64 = await sodium.crypto_secretbox_easy(
        mainDevice.ciphertext,
        mainDevice.nonce,
        exportKey
      );
      const privateKeyPairString = sodium.from_base64_to_string(
        decryptedCiphertextBase64
      );
      const privateKeyPairs = JSON.parse(privateKeyPairString);
      // now we should have: privateKeyPairs = { signingPrivateKey, encryptionPrivateKey }
      // TODO: store the keys in memory
    }
  };

  const onLoginPress = async () => {
    setDidLoginSucceed(false);
    setGqlErrorMessage("");
    const sessionKeys = await login(username, password);
    if (!sessionKeys) {
      if (props.onLoginFail) {
        props.onLoginFail();
      }
    } else {
      await fetchMainDevice(sessionKeys.exportKey);
      if (props.onLoginSuccess) {
        props.onLoginSuccess();
        return true;
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
