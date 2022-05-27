import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Text,
  View,
  Box,
  Button,
  Checkbox,
  tw,
  Link,
  LabeledInput,
} from "@serenity-tools/ui";
import {
  createClientKeyPair,
  createOprfChallenge,
  createOprfRegistrationEnvelope,
} from "@serenity-tools/opaque/client";
import {
  useFinalizeRegistrationMutation,
  useInitializeRegistrationMutation,
} from "../../generated/graphql";
import { useWindowDimensions } from "react-native";
import { RootStackScreenProps } from "../../types";

export default function RegisterScreen(
  props: RootStackScreenProps<"Register">
) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [clientPublicKey, setClientPublicKey] = useState("");
  const [clientPrivateKey, setClientPrivateKey] = useState("");
  const [didRegistrationSucceed, setDidRegistrationSucceed] = useState(false);
  const [, initializeRegistrationMutation] =
    useInitializeRegistrationMutation();
  const [, finalizeRegistrationMutation] = useFinalizeRegistrationMutation();
  const [errorMessage, setErrorMessage] = useState("");
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
    } else {
      const keys = createClientKeyPair();
      setClientPublicKey(keys.publicKey);
      setClientPrivateKey(keys.privateKey);
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
    const mutationResult = await initializeRegistrationMutation({
      input: {
        username: username,
        challenge: oprfChallenge,
      },
    });
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
    const { secret, nonce } = await createOprfRegistrationEnvelope(
      password,
      clientPublicKey,
      clientPrivateKey,
      randomScalar,
      serverChallengeResponse,
      serverPublicKey,
      oprfPublicKey
    );
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
        workspaceId: uuidv4(),
      },
    });
    // check for an error
    if (mutationResult.data && mutationResult.data.finalizeRegistration) {
      const serverRegistrationResponse =
        mutationResult.data.finalizeRegistration;
      setDidRegistrationSucceed(true);
      // reset since the user might end up on this screen again
      setPassword("");
      setUsername("");
      props.navigation.push("Login");
    } else if (mutationResult.error) {
      const errorMessage = mutationResult.error.message.substring(
        mutationResult.error.message.indexOf("] ") + 2
      );
      setErrorMessage(errorMessage);
      throw Error(errorMessage);
    }
    localStorage.setItem(OPRF_SECRET_STORAGE_KEY, secret);
    localStorage.setItem(OPRF_NONCE_STORAGE_KEY, nonce);
  };

  const onRegisterPress = async () => {
    if (!hasAcceptedTerms) {
      setErrorMessage("Please accept the terms of service first.");
      return;
    }
    setDidRegistrationSucceed(false);
    setErrorMessage("");
    let oprfChallengeResponse: any = null;
    try {
      // TODO the getServerOprfChallenge should include a signature of the challenge response and be verified that it belongs to
      // the server public to make sure it wasn't tampered with
      oprfChallengeResponse = await getServerOprfChallenge();
    } catch (error) {
      console.log("error getting server challenge");
      console.log(error);
      setErrorMessage(error.toString());
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
        setErrorMessage(error.toString());
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
    <View
      style={tw`bg-white xs:bg-primary-900 justify-center items-center flex-auto`}
    >
      {/* TODO use this as classes or default/variant ? */}
      <Box style={tw`max-w-md w-full`}>
        <View>
          <Text variant="large" bold style={tw`text-center`}>
            Register
          </Text>
          <Text muted style={tw`text-center`}>
            Sign up and start your free trial!
            <br />
            No credit card required.
          </Text>
        </View>

        {errorMessage && (
          <View>
            <Text>{errorMessage}</Text>
          </View>
        )}

        {didRegistrationSucceed && (
          <View>
            <Text>Registration Succeeded</Text>
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

        <Checkbox
          value={"hasAcceptedTerms"}
          isChecked={hasAcceptedTerms}
          onChange={setHasAcceptedTerms}
          accessibilityLabel="This is the terms and condition checkbox"
        >
          <Text variant="xs" muted>
            Yes, I do agree to Serenity's{" "}
            <Link to={{ screen: "NotFound" }}>terms of services</Link> and{" "}
            <Link to={{ screen: "NotFound" }}>privacy policy</Link>.
          </Text>
        </Checkbox>

        <Button onPress={onRegisterPress}>Register</Button>

        <View style={tw`text-center`}>
          <Text variant="xs" muted>
            Already have an account?{" "}
          </Text>
          <Text variant="xs">
            <Link to={{ screen: "Login" }}>Login here</Link>
          </Text>
        </View>
      </Box>
    </View>
  );
}
