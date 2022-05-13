import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Text,
  View,
  Input,
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

export default function RegisterScreen(props) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
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
        workspaceId: uuidv4(),
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
      props.navigation.navigate("Login");
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
      // TODO the getServerOprfChallenge should include a signature of the challenge response and be verified that it belongs to
      // the server public to make sure it wasn't tampered with
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
    <View
      style={tw`bg-white xs:bg-primary-900 justify-center items-center flex-auto`}
    >
      {/* TODO use this as classes or default/variant ? */}
      <Box style={tw`max-w-md w-full`}>
        <View>
          <Text style={tw`h1 text-center`}>Register</Text>
          <Text muted style={tw`text-center`}>
            Sign up and start your free trial!
            <br />
            No credit card required.
          </Text>
        </View>

        {hasGqlError && (
          <View>
            <Text>{gqlErrorMessage}</Text>
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
          value="dummy"
          accessibilityLabel="This is the terms and condition checkbox"
        >
          <Text variant="small" muted>
            Yes, I do agree to Serenity's{" "}
            <Link to={{ screen: "NotFound" }}>terms of services</Link> and{" "}
            <Link to={{ screen: "NotFound" }}>privacy policy</Link>.
          </Text>
        </Checkbox>

        <Button onPress={onRegisterPress}>Register</Button>

        <View style={tw`text-center`}>
          <Text variant="small" muted>
            Already have an account?{" "}
          </Text>
          <Text variant="small">
            <Link to={{ screen: "Login" }}>Login here</Link>
          </Text>
        </View>
      </Box>
    </View>
  );
}
