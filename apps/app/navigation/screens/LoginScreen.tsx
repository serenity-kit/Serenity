import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  Box,
  Button,
  Input,
  tw,
  Link,
  LabeledInput,
} from "@serenity-tools/ui";
import {
  createClientKeyPair,
  createOprfChallenge,
  createUserSession,
} from "@serenity-tools/opaque/client";
import { decryptSessionJsonMessage } from "@serenity-tools/opaque/common";
import {
  useInitializeLoginMutation,
  useFinalizeLoginMutation,
} from "../../generated/graphql";
import { useWindowDimensions } from "react-native";
import { RootStackScreenProps } from "../../types";
import { useAuthentication } from "../../context/AuthenticationContext";

export default function LoginScreen(props: RootStackScreenProps<"Login">) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [didLoginSucceed, setDidLoginSucceed] = useState(false);
  const [, initializeLoginMutation] = useInitializeLoginMutation();
  const [, finalizeLoginMutation] = useFinalizeLoginMutation();
  const [hasGqlError, setHasGqlError] = useState(false);
  const [gqlErrorMessage, setGqlErrorMessage] = useState("");
  const [oauthAccessToken, setOauthAccessToken] = useState("");
  const [accessTokenExpiresIn, setAccessTokenExpiresIn] = useState(0);
  const { updateAuthentication } = useAuthentication();
  const OPRF_CLIENT_KEYS_STORAGE_KEY = "oprf.clientKeys";
  const OPRF_CLIENT_SESSION_KEYS_STORAGE_KEY = "oprf.sessionKeys";

  useEffect(() => {
    getOrGenerateKeys();
  }, []);

  const getOrGenerateKeys = () => {
    let serializedKeyData = localStorage.getItem(OPRF_CLIENT_KEYS_STORAGE_KEY);
    if (serializedKeyData) {
      const keys = JSON.parse(serializedKeyData);
    } else {
      const keys = createClientKeyPair();
      localStorage.setItem(OPRF_CLIENT_KEYS_STORAGE_KEY, JSON.stringify(keys));
    }
  };

  const getServerOprfChallenge = async () => {
    const { oprfChallenge, randomScalar } = await createOprfChallenge(password);
    // setOprfChallenge(oprfChallenge)
    // setRandomScalar(randomScalar)
    // do some graphql stuff here, including:
    // * username,
    // * oprfChallenge
    // server will respond with:
    // * serverChallengeResponse
    // * serverPublicKey
    // * oprfPublicKey
    const mutationResult = await initializeLoginMutation({
      input: {
        username: username,
        challenge: oprfChallenge,
      },
    });
    // check for an error
    if (mutationResult.data && mutationResult.data.initializeLogin) {
      const serverChallengeResponse = mutationResult.data.initializeLogin;
      // setServerChallengeResponse(serverChallengeResponse.oprfChallengeResponse)
      // setServerPublicKey(serverChallengeResponse.serverPublicKey)
      // setOprfPublicKey(serverChallengeResponse.oprfPublicKey)
      const oprfChallengeResponse = {
        randomScalar,
        serverChallengeResponse,
      };
      return oprfChallengeResponse;
    } else if (mutationResult.error) {
      const errorMessage = mutationResult.error.message.substring(
        mutationResult.error.message.indexOf("] ") + 2
      );
      throw Error(errorMessage);
    }
  };

  const getEncryptedOauthToken = async (
    randomScalar: string,
    serverChallengeResponse: string,
    secret: string,
    nonce: string,
    oprfPublicKey: string
  ) => {
    const clientSessionKeys = await createUserSession(
      password,
      secret,
      nonce,
      oprfPublicKey,
      randomScalar,
      serverChallengeResponse
    );
    localStorage.setItem(
      OPRF_CLIENT_SESSION_KEYS_STORAGE_KEY,
      JSON.stringify(clientSessionKeys)
    );
    // ask the server to store the login, send
    // * username,
    const mutationResult = await finalizeLoginMutation({
      input: { username },
    });
    // check for an error
    if (mutationResult.data && mutationResult.data.finalizeLogin) {
      const serverLoginResponse = mutationResult.data.finalizeLogin;
      return {
        serverLoginResponse,
        clientSessionKeys,
      };
    } else if (mutationResult.error) {
      const errorMessage = mutationResult.error.message.substring(
        mutationResult.error.message.indexOf("] ") + 2
      );
      setHasGqlError(true);
      setGqlErrorMessage(errorMessage);
      throw Error(errorMessage);
    }
  };

  const decryptEncryptedOauthToken = (
    encryptedOauthToken: string,
    nonce: string,
    clientSessionSharedRxKey: string
  ) => {
    const oauthTokenData = decryptSessionJsonMessage(
      encryptedOauthToken,
      nonce,
      clientSessionSharedRxKey
    );
    return oauthTokenData;
  };

  const onLoginPress = async () => {
    setDidLoginSucceed(false);
    setHasGqlError(false);
    setGqlErrorMessage("");
    let oprfChallengeResponse: any = null;
    let encryptedOauthTokenData: any = null;
    try {
      oprfChallengeResponse = await getServerOprfChallenge();
    } catch (error) {
      console.log("error getting server challenge");
      console.log(error);
      setHasGqlError(true);
      setGqlErrorMessage(error.toString());
    }
    if (oprfChallengeResponse) {
      try {
        encryptedOauthTokenData = await getEncryptedOauthToken(
          oprfChallengeResponse.randomScalar,
          oprfChallengeResponse.serverChallengeResponse.oprfChallengeResponse,
          oprfChallengeResponse.serverChallengeResponse.secret,
          oprfChallengeResponse.serverChallengeResponse.nonce,
          oprfChallengeResponse.serverChallengeResponse.oprfPublicKey
        );
      } catch (error) {
        console.log("error logging in");
        console.log(error);
        setHasGqlError(true);
        setGqlErrorMessage(error.toString());
      }
    }
    if (encryptedOauthTokenData) {
      console.log({ encryptedOauthTokenData });
      try {
        const oauthAccessData = decryptEncryptedOauthToken(
          encryptedOauthTokenData.serverLoginResponse.oauthData,
          encryptedOauthTokenData.serverLoginResponse.nonce,
          encryptedOauthTokenData.clientSessionKeys.sharedRx
        );
        setDidLoginSucceed(true);
        setOauthAccessToken(oauthAccessData.accessToken);
        setAccessTokenExpiresIn(oauthAccessData.expiresIn);
        updateAuthentication(`TODO+${username}`);
        props.navigation.navigate("Root");
      } catch (error) {
        setHasGqlError(true);
        setGqlErrorMessage("Invalid email or password");
      }
    }
  };

  const onUsernameChangeText = (username: string) => {
    setUsername(username);
  };

  const onPasswordChangeText = (password: string) => {
    setPassword(password);
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
          onChangeText={onUsernameChangeText}
          placeholder="Enter your email …"
        />

        <LabeledInput
          label={"Password"}
          secureTextEntry
          value={password}
          onChangeText={onPasswordChangeText}
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
