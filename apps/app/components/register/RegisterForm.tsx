import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Text,
  View,
  Button,
  Checkbox,
  tw,
  Link,
  LabeledInput,
} from "@serenity-tools/ui";
import {
  useFinishRegistrationMutation,
  useStartRegistrationMutation,
} from "../../generated/graphql";
import { useWindowDimensions } from "react-native";
import { registerInitialize, finishRegistration } from "@serenity-tools/opaque";
import { VStack } from "native-base";
import {
  createAndEncryptDevice,
  createEncryptionKeyFromOpaqueExportKey,
} from "@serenity-tools/common";
import { setMainDevice } from "../../utils/mainDeviceMemoryStore/mainDeviceMemoryStore";

type Props = {
  onRegisterSuccess?: (username: string, verificationCode: string) => void;
  onRegisterFail?: () => void;
};

export default function RegisterForm(props: Props) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [, finishRegistrationMutation] = useFinishRegistrationMutation();
  const [, startRegistrationMutation] = useStartRegistrationMutation();
  const [errorMessage, setErrorMessage] = useState("");

  const onRegisterPress = async () => {
    if (!hasAcceptedTerms) {
      setErrorMessage("Please accept the terms of service first.");
      return;
    }
    setErrorMessage("");
    try {
      // TODO the getServerChallenge should include a signature of the challenge response and be verified that it belongs to
      // the server public to make sure it wasn't tampered with
      const challenge = await registerInitialize(password);
      const startRegistrationResult = await startRegistrationMutation({
        input: {
          username,
          challenge,
        },
      });
      if (startRegistrationResult.data?.startRegistration) {
        const { response, exportKey } = await finishRegistration(
          startRegistrationResult.data.startRegistration.challengeResponse
        );

        const { encryptionPrivateKey, signingPrivateKey, ...mainDevice } =
          await createAndEncryptDevice(exportKey);

        setMainDevice({
          encryptionPrivateKey: encryptionPrivateKey,
          signingPrivateKey: signingPrivateKey,
          signingPublicKey: mainDevice.signingPublicKey,
          encryptionPublicKey: mainDevice.encryptionPublicKey,
        });

        const finishRegistrationResult = await finishRegistrationMutation({
          input: {
            message: response,
            registrationId:
              startRegistrationResult.data.startRegistration.registrationId,
            mainDevice,
          },
        });
        // check for an error
        if (finishRegistrationResult.data?.finishRegistration?.id) {
          if (props.onRegisterSuccess) {
            props.onRegisterSuccess(
              username,
              finishRegistrationResult.data?.finishRegistration.verificationCode
            );
          }
          // reset since the user might end up on this screen again
          setPassword("");
          setUsername("");
        } else if (finishRegistrationResult.error) {
          setErrorMessage("Failed to register.");
          if (props.onRegisterFail) {
            props.onRegisterFail();
          }
          throw Error(errorMessage);
        }
      } else {
        console.error(startRegistrationResult.error);
        if (props.onRegisterFail) {
          props.onRegisterFail();
        }
        throw Error("Failed to register.");
      }
    } catch (error) {
      setErrorMessage(error.toString());
      if (props.onRegisterFail) {
        props.onRegisterFail();
      }
    }
  };

  return (
    <VStack space="5">
      {errorMessage ? (
        <View>
          <Text>{errorMessage}</Text>
        </View>
      ) : null}

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

      <Button onPress={onRegisterPress} size="large">
        Register
      </Button>

      <View style={tw`text-center`}>
        <Text variant="xs" muted>
          Already have an account?
        </Text>
        <Text variant="xs">
          <Link to={{ screen: "Login" }}>Login here</Link>
        </Text>
      </View>
    </VStack>
  );
}
