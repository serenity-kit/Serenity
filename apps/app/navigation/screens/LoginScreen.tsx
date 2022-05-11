import React, { useState, useEffect } from "react";
import { Text, View, Box, Button, Input, tw, Link } from "@serenity-tools/ui";
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

export default function LoginScreen(props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [didLoginSucceed, setDidLoginSucceed] = useState(false);
  const [, initializeLoginMutation] = useInitializeLoginMutation();
  const [, finalizeLoginMutation] = useFinalizeLoginMutation();
  const [hasGqlError, setHasGqlError] = useState(false);
  const [gqlErrorMessage, setGqlErrorMessage] = useState("");
  const [oauthAccessToken, setOauthAccessToken] = useState("");
  const [accessTokenExpiresIn, setAccessTokenExpiresIn] = useState(0);
  const OPRF_CLIENT_KEYS_STORAGE_KEY = "oprf.clientKeys";
  const OPRF_CLIENT_SESSION_KEYS_STORAGE_KEY = "oprf.sessionKeys";

  useEffect(() => {
    getOrGenerateKeys();
  }, []);

  const getOrGenerateKeys = () => {
    let serializedKeyData = localStorage.getItem(OPRF_CLIENT_KEYS_STORAGE_KEY);
    if (serializedKeyData) {
      const keys = JSON.parse(serializedKeyData);
      console.log("retrieved client keys");
      console.log({ keys });
    } else {
      const keys = createClientKeyPair();
      localStorage.setItem(OPRF_CLIENT_KEYS_STORAGE_KEY, JSON.stringify(keys));
      console.log("generated client keys");
      console.log({ keys });
    }
  };

  const getServerOprfChallenge = async () => {
    console.log("Generating OPRF challenge");
    const { oprfChallenge, randomScalar } = await createOprfChallenge(password);
    // setOprfChallenge(oprfChallenge)
    // setRandomScalar(randomScalar)
    console.log({ oprfChallenge, randomScalar });
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
    console.log({ mutationResult });
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
    console.log("Logging in");
    console.log({ randomScalar });

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
    console.log({ clientSessionKeys });
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
    console.log({ oauthTokenData });
    return oauthTokenData;
  };

  const onLoginPress = async () => {
    setDidLoginSucceed(false);
    setHasGqlError(false);
    setGqlErrorMessage("");
    console.log("click");
    console.log(`username: ${username}, password: ${password}`);
    let oprfChallengeResponse: any = null;
    let encryptedOauthTokenData: any = null;
    try {
      oprfChallengeResponse = await getServerOprfChallenge();
      console.log({ oprfChallengeResponse });
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
        // TODO replace with proper authentication
        localStorage.setItem("deviceSigningPublicKey", `TODO+${username}`);
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
          <Text style={tw`h1 text-center`}>Welcome back!</Text>
          <Text style={tw`text-center text-muted`}>
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

        <View>
          <Text>Email</Text>
          <Input
            keyboardType="email-address"
            value={username}
            onChangeText={onUsernameChangeText}
            placeholder="Enter your email …"
          />
        </View>

        <View>
          <Text>Password</Text>
          <Input
            secureTextEntry
            value={password}
            onChangeText={onPasswordChangeText}
            placeholder="Enter your password …"
          />
        </View>

        <Button onPress={onLoginPress}>Log in</Button>
        <View style={tw`text-center`}>
          <Text style={tw`small text-muted`}>Don't have an account? </Text>
          <Link style={tw`small`} to={{ screen: "Register" }}>
            Register here
          </Link>
        </View>
      </Box>
    </View>
  );
}
