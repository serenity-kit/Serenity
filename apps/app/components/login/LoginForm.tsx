import React, { useState } from "react";
import { Button, LabeledInput, Text, View, Link, tw } from "@serenity-tools/ui";
import {
  useStartLoginMutation,
  useFinishLoginMutation,
  MainDeviceQuery,
  MainDeviceDocument,
} from "../../generated/graphql";
import { useAuthentication } from "../../context/AuthenticationContext";
import { startLogin, finishLogin } from "@serenity-tools/opaque";
import { useWindowDimensions } from "react-native";
import { VStack } from "native-base";
import { createEncryptionKeyFromOpaqueExportKey } from "@serenity-tools/utils";
import { useClient } from "urql";
import * as sodium from "@serenity-tools/libsodium";

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

  const [, startLoginMutation] = useStartLoginMutation();
  const [, finishLoginMutation] = useFinishLoginMutation();
  const urqlClient = useClient();

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
    const message = await startLogin(password);
    const startLoginResult = await startLoginMutation({
      input: {
        username: username,
        challenge: message,
      },
    });
    // check for an error
    if (startLoginResult.data?.startLogin) {
      const result = await finishLogin(
        startLoginResult.data.startLogin.challengeResponse
      );

      const finishLoginResult = await finishLoginMutation({
        input: {
          loginId: startLoginResult.data.startLogin.loginId,
          message: result.response,
        },
      });

      if (finishLoginResult.data?.finishLogin) {
        updateAuthentication(
          finishLoginResult.data.finishLogin.mainDeviceSigningPublicKey
        );
        return result;
      } else if (finishLoginResult.error) {
        throw new Error("Failed to finish login");
      }
    } else if (startLoginResult.error) {
      console.error(startLoginResult.error);
      throw new Error("Failed to start login");
    }
    throw new Error("Failed to login");
  };

  const fetchMainDevice = async (exportKey: string) => {
    const mainDeviceResult = await urqlClient
      .query<MainDeviceQuery>(MainDeviceDocument, undefined, {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
      })
      .toPromise();

    if (mainDeviceResult.data?.mainDevice) {
      const mainDevice = mainDeviceResult.data.mainDevice;
      const { encryptionKey } = await createEncryptionKeyFromOpaqueExportKey(
        exportKey,
        mainDevice.encryptionKeySalt
      );
      console.log("login exportKey", exportKey);
      console.log("login encryptionKeySalt", mainDevice.encryptionKeySalt);
      console.log("login encryptionKey", encryptionKey);

      const decryptedCiphertextBase64 = await sodium.crypto_secretbox_open_easy(
        mainDevice.ciphertext,
        mainDevice.nonce,
        encryptionKey
      );
      const privateKeyPairString = sodium.from_base64_to_string(
        decryptedCiphertextBase64
      );
      const privateKeyPairs = JSON.parse(privateKeyPairString);
      console.log("privateKeyPairs", privateKeyPairs);
      // TODO: store the keys in memory
    } else {
      throw new Error("Failed to fetch main device.");
    }
  };

  const onLoginPress = async () => {
    try {
      setGqlErrorMessage("");
      setIsLoggingIn(true);
      const loginResult = await login(username, password);
      await fetchMainDevice(loginResult.exportKey);
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
