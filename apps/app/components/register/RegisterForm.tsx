import React, { useState } from "react";
import {
  Text,
  View,
  Button,
  Checkbox,
  Link,
  LabeledInput,
  LinkExternal,
  InfoMessage,
} from "@serenity-tools/ui";
import {
  useFinishRegistrationMutation,
  useStartRegistrationMutation,
} from "../../generated/graphql";
import { useWindowDimensions } from "react-native";
import { registerInitialize, finishRegistration } from "@serenity-tools/opaque";
import { VStack } from "native-base";
import { createAndEncryptDevice } from "@serenity-tools/common";
import { setMainDevice } from "../../utils/device/mainDeviceMemoryStore";
import { storeUsernamePassword } from "../../utils/authentication/registrationMemoryStore";

type Props = {
  pendingWorkspaceInvitationId?: string;
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
      setErrorMessage("Please accept the terms of service.");
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
          info: JSON.stringify({ type: "main" }),
        });

        const finishRegistrationResult = await finishRegistrationMutation({
          input: {
            message: response,
            registrationId:
              startRegistrationResult.data.startRegistration.registrationId,
            mainDevice,
            pendingWorkspaceInvitationId: props.pendingWorkspaceInvitationId,
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
          storeUsernamePassword(username, password);
          setPassword("");
          setUsername("");
        } else if (finishRegistrationResult.error) {
          if (
            finishRegistrationResult.error.graphQLErrors[0].extensions.code ===
            "EXPECTED_GRAPHQL_ERROR"
          ) {
            throw new Error(
              finishRegistrationResult.error.graphQLErrors[0].message
            );
          } else {
            throw new Error(
              "Failed to register. Please try again or contact our support."
            );
          }
        }
      } else {
        throw new Error(
          "Failed to register. Please try again or contact our support."
        );
      }
    } catch (error) {
      setErrorMessage(error.message);
      if (props.onRegisterFail) {
        props.onRegisterFail();
      }
    }
  };

  return (
    <VStack space="5">
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
          <LinkExternal
            variant="xs"
            href="https://www.serenity.re/en/notes/terms-of-service"
          >
            terms of services
          </LinkExternal>{" "}
          and{" "}
          <LinkExternal
            variant="xs"
            href="https://www.serenity.re/en/notes/privacy-policy"
          >
            privacy policy
          </LinkExternal>
          .
        </Text>
      </Checkbox>

      {errorMessage ? (
        <InfoMessage variant="error" icon>
          {errorMessage}
        </InfoMessage>
      ) : null}

      <Button onPress={onRegisterPress} size="large">
        Register
      </Button>
    </VStack>
  );
}
