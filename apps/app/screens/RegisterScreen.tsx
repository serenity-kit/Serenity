import React, { useState, useEffect } from "react";
import { StyleSheet } from "react-native";

import { Text, View, Input, Button } from "@serenity-tools/ui";
import {
  createClientKeyPair,
  createOprfChallenge,
  createOprfRegistrationEnvelope,
} from "@serenity-tools/opaque/client";
import {
  useFinalizeRegistrationMutation,
  useInitializeRegistrationMutation,
} from "../generated/graphql";

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [clientPublicKey, setClientPublicKey] = useState("");
  const [clientPrivateKey, setClientPrivateKey] = useState("");
  const [didRegistrationSucceed, setDidRegistrationSucceed] = useState(false);
  const [, initializeRegistrationMutation] =
    useInitializeRegistrationMutation();
  const [, finalizeRegistrationMutation] = useFinalizeRegistrationMutation();
  const [hasGqlError, setHasGqlError] = useState(false);
  const [gqlErrorMessage, setGqlErrorMessage] = useState("");
  const OPRF_CLIENT_KEYS_STORAGE_KEY = "oprf.clientKeys";
  const OPRF_SECRET_STORAGE_KEY = "oprf.secret";
  const OPRF_NONCE_STORAGE_KEY = "oprf.nonce";

  useEffect(() => {
    getOrGenerateKeys();
  }, []);

  const getOrGenerateKeys = () => {
    let serializedKeyData = localStorage.getItem(OPRF_CLIENT_KEYS_STORAGE_KEY);
    if (serializedKeyData) {
      const keys = JSON.parse(serializedKeyData);
      setClientPublicKey(keys.publicKey);
      setClientPrivateKey(keys.privateKey);
      console.log("retrieved client keys");
      console.log({ keys });
    } else {
      const keys = createClientKeyPair();
      setClientPublicKey(keys.publicKey);
      setClientPrivateKey(keys.privateKey);
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
    const mutationResult = await initializeRegistrationMutation({
      input: {
        username: username,
        challenge: oprfChallenge,
      },
    });
    console.log({ mutationResult });
    // check for an error
    if (mutationResult.data && mutationResult.data.initializeRegistration) {
      const serverChallengeResponse =
        mutationResult.data.initializeRegistration;
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

  const registerAccount = async (
    randomScalar: string,
    serverChallengeResponse: string,
    serverPublicKey: string,
    oprfPublicKey: string
  ) => {
    console.log("Registering account");
    console.log({ randomScalar });
    const { secret, nonce } = await createOprfRegistrationEnvelope(
      password,
      clientPublicKey,
      clientPrivateKey,
      randomScalar,
      serverChallengeResponse,
      serverPublicKey,
      oprfPublicKey
    );
    console.log({ secret, nonce });
    // ask the server to store the registration, send
    // * username,
    // * secret (aka cipherText),
    // * nonce
    // * clientPublicKey
    const mutationResult = await finalizeRegistrationMutation({
      input: {
        username,
        secret,
        nonce,
        clientPublicKey,
      },
    });
    console.log({ mutationResult });
    // check for an error
    if (mutationResult.data && mutationResult.data.finalizeRegistration) {
      const serverRegistrationResponse =
        mutationResult.data.finalizeRegistration;
      setDidRegistrationSucceed(
        serverRegistrationResponse.status === "success"
      );
      return serverRegistrationResponse;
    } else if (mutationResult.error) {
      const errorMessage = mutationResult.error.message.substring(
        mutationResult.error.message.indexOf("] ") + 2
      );
      setHasGqlError(true);
      setGqlErrorMessage(errorMessage);
      throw Error(errorMessage);
    }
    localStorage.setItem(OPRF_SECRET_STORAGE_KEY, secret);
    localStorage.setItem(OPRF_NONCE_STORAGE_KEY, nonce);
  };

  const onRegisterPress = async () => {
    console.log("click");
    console.log(`username: ${username}, password: ${password}`);
    setDidRegistrationSucceed(false);
    setHasGqlError(false);
    setGqlErrorMessage("");
    let oprfChallengeResponse: any = null;
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
        await registerAccount(
          oprfChallengeResponse.randomScalar,
          oprfChallengeResponse.serverChallengeResponse.oprfChallengeResponse,
          oprfChallengeResponse.serverChallengeResponse.serverPublicKey,
          oprfChallengeResponse.serverChallengeResponse.oprfPublicKey
        );
      } catch (error) {
        console.log("error registering account");
        console.log(error);
        setHasGqlError(true);
        setGqlErrorMessage(error.toString());
      }
    }
    // const serverRegistrationResponse = await registerAccount()
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

      {didRegistrationSucceed && (
        <View style={styles.infoAlert}>
          <Text style={styles.alertText}>Registration Succeeded</Text>
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <Input
          keyboardType="email-address"
          value={username}
          onChangeText={onUsernameChangeText}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password</Text>
        <Input
          secureTextEntry
          value={password}
          onChangeText={onPasswordChangeText}
        />
      </View>

      <Button onPress={onRegisterPress}>Register</Button>
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
