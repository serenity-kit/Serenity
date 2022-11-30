import {
  createAndEncryptDevice,
  encryptWorkspaceInvitationPrivateKey,
} from "@serenity-tools/common";
import { finishRegistration, registerInitialize } from "@serenity-tools/opaque";
import {
  Button,
  Checkbox,
  FormWrapper,
  InfoMessage,
  Input,
  LinkExternal,
  Text,
} from "@serenity-tools/ui";
import { useEffect, useState } from "react";
import { useWindowDimensions } from "react-native";
import { useAppContext } from "../../context/AppContext";
import {
  useFinishRegistrationMutation,
  useStartRegistrationMutation,
} from "../../generated/graphql";
import { storeUsernamePassword } from "../../utils/authentication/registrationMemoryStore";
import { setMainDevice } from "../../utils/device/mainDeviceMemoryStore";

type Props = {
  pendingWorkspaceInvitationId?: string;
  workspaceInvitationKey?: string;
  onRegisterSuccess?: (username: string, verificationCode: string) => void;
  isFocused: boolean;
};

export default function RegisterForm(props: Props) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const { updateAuthentication } = useAppContext();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [, finishRegistrationMutation] = useFinishRegistrationMutation();
  const [, startRegistrationMutation] = useStartRegistrationMutation();
  const [errorMessage, setErrorMessage] = useState("");

  // we want to reset the form when the user navigates away from the screen
  // to avoid having the form filled and potentially allowing someone else to
  // steal the login data with brief access to the client
  useEffect(() => {
    if (!props.isFocused) {
      setUsername("");
      setPassword("");
      setErrorMessage("");
      setIsRegistering(false);
      setHasAcceptedTerms(false);
    }
  }, [props.isFocused]);

  const onRegisterPress = async () => {
    if (!hasAcceptedTerms) {
      setErrorMessage("Please accept the terms of service.");
      return;
    }
    setErrorMessage("");
    setIsRegistering(true);
    try {
      // TODO the getServerChallenge should include a signature of the challenge response and be verified that it belongs to
      // the server public to make sure it wasn't tampered with
      await updateAuthentication(null);
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

        let pendingWorkspaceInvitationKeySubkeyId: number | null = null;
        let pendingWorkspaceInvitationKeyCiphertext: string | null = null;
        let pendingWorkspaceInvitationKeyPublicNonce: string | null = null;
        let pendingWorkspaceInvitationKeyEncryptionSalt: string | null = null;
        if (props.workspaceInvitationKey) {
          const encryptedWorkspaceKeyData =
            await encryptWorkspaceInvitationPrivateKey({
              exportKey,
              workspaceInvitationSigningPrivateKey: signingPrivateKey,
            });
          pendingWorkspaceInvitationKeySubkeyId =
            encryptedWorkspaceKeyData.subkeyId;
          pendingWorkspaceInvitationKeyCiphertext =
            encryptedWorkspaceKeyData.ciphertext;
          pendingWorkspaceInvitationKeyPublicNonce =
            encryptedWorkspaceKeyData.publicNonce;
          pendingWorkspaceInvitationKeyEncryptionSalt =
            encryptedWorkspaceKeyData.encryptionKeySalt;
        }
        const finishRegistrationResult = await finishRegistrationMutation({
          input: {
            message: response,
            registrationId:
              startRegistrationResult.data.startRegistration.registrationId,
            mainDevice,
            pendingWorkspaceInvitationId: props.pendingWorkspaceInvitationId,
            pendingWorkspaceInvitationKeySubkeyId,
            pendingWorkspaceInvitationKeyCiphertext,
            pendingWorkspaceInvitationKeyPublicNonce,
            pendingWorkspaceInvitationKeyEncryptionSalt,
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
          storeUsernamePassword(username, password);
          // reset since the user might end up on this screen again
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
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <FormWrapper>
      <Input
        label={"Email"}
        keyboardType="email-address"
        value={username}
        onChangeText={(username: string) => {
          setUsername(username);
        }}
        placeholder="Enter your email …"
        autoCapitalize="none"
      />

      <Input
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

      <Button onPress={onRegisterPress} isLoading={isRegistering}>
        Register
      </Button>
    </FormWrapper>
  );
}
