import React, { useState, useRef, useEffect } from "react";
import { StyleSheet, Button, TextInput } from "react-native";

import { Text, View } from "@serenity-tools/ui";
import { RootStackScreenProps } from "../types";
import {
  createClientKeyPair,
  createOprfChallenge,
  createUserSession,
  decryptSessionJsonMessage,
} from "@serenity-tools/opaque/client";
import {
  useInitializeLoginMutation,
  useFinalizeLoginMutation,
} from "../generated/graphql";
// import { StringKeyPair } from '@serenity-tools/libsodium';

export default function LoginScreen() {
  const [username, setUsername] = useState("email16@example.com");
  const [password, setPassword] = useState("password");
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
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      {hasGqlError && (
        <View style={styles.errorAlert}>
          <Text style={styles.alertText}>{gqlErrorMessage}</Text>
        </View>
      )}

      {didLoginSucceed && (
        <View style={styles.infoAlert}>
          <Text style={styles.alertText}>Login Succeeded</Text>
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          keyboardType="email-address"
          value={username}
          onChangeText={onUsernameChangeText}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={onPasswordChangeText}
        />
      </View>

      <View>
        <Text style={styles.label}>OauthToken: {oauthAccessToken}</Text>
        <Text style={styles.label}>
          Token expires in: {Math.round(accessTokenExpiresIn / (24 * 60 * 60))}{" "}
          days
        </Text>
      </View>

      <Button color="#66a" onPress={onLoginPress} title="Log in" />
    </View>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    margin: 20,
    borderWidth: 1,
    borderColor: "#fff",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: "#2e78b7",
  },
  label: {
    fontSize: 14,
  },
  input: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#2e78b7",
    color: "#ccc",
  },
  button: {
    padding: 20,
    backgroundColor: "#a33",
  },
  alert: {
    padding: 20,
    borderWidth: 1,
  },
  errorAlert: {
    padding: 20,
    borderWidth: 1,
    backgroundColor: "#a33",
    borderColor: "#c66",
  },
  infoAlert: {
    padding: 20,
    borderWidth: 1,
    backgroundColor: "#a33",
    borderColor: "#cc6",
  },
  alertText: {},
});
