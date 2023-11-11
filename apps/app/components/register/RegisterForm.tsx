import * as userChain from "@serenity-kit/user-chain";
import {
  createAndEncryptMainDevice,
  encryptWorkspaceInvitationPrivateKey,
} from "@serenity-tools/common";
import {
  Button,
  Checkbox,
  FormWrapper,
  InfoMessage,
  Input,
  LinkExternal,
  Text,
  View,
  tw,
} from "@serenity-tools/ui";
import { zxcvbn, zxcvbnOptions } from "@zxcvbn-ts/core";
import * as zxcvbnCommonPackage from "@zxcvbn-ts/language-common";
import * as zxcvbnEnPackage from "@zxcvbn-ts/language-en";
import { useEffect, useState } from "react";
import { useWindowDimensions } from "react-native";
import { client } from "react-native-opaque";
import { z } from "zod";
import { useAppContext } from "../../context/AppContext";
import {
  useFinishRegistrationMutation,
  useStartRegistrationMutation,
} from "../../generated/graphql";
import { setMainDevice } from "../../store/mainDeviceMemoryStore";
import { setRegistrationInfo } from "../../utils/authentication/registrationMemoryStore";
import { getOpaqueServerPublicKey } from "../../utils/getOpaqueServerPublicKey/getOpaqueServerPublicKey";

// setup zxcvbn
const options = {
  translations: zxcvbnEnPackage.translations,
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
  },
};
zxcvbnOptions.setOptions(options);

type Props = {
  pendingWorkspaceInvitationId?: string;
  workspaceInvitationKey?: string;
  onRegisterSuccess?: (
    username: string,
    verificationCode?: string | null
  ) => void;
  isFocused: boolean;
};

export default function RegisterForm(props: Props) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const { updateAuthentication } = useAppContext();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordStrengthEvaluation, setPasswordStrengthEvaluation] = useState(
    zxcvbn(password)
  );
  const [isRegistering, setIsRegistering] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [, finishRegistrationMutation] = useFinishRegistrationMutation();
  const [, startRegistrationMutation] = useStartRegistrationMutation();
  const [errorMessage, setErrorMessage] = useState<
    "none" | "accept-tos" | "email" | "password"
  >("none");

  // we want to reset the form when the user navigates away from the screen
  // to avoid having the form filled and potentially allowing someone else to
  // steal the login data with brief access to the client
  useEffect(() => {
    if (!props.isFocused) {
      setUsername("");
      setPassword("");
      setPasswordStrengthEvaluation(zxcvbn(""));
      setErrorMessage("none");
      setIsRegistering(false);
      setHasAcceptedTerms(false);
    }
  }, [props.isFocused]);

  const onRegisterPress = async () => {
    if (!hasAcceptedTerms) {
      setErrorMessage("accept-tos");
      return;
    }
    setErrorMessage("none");
    setIsRegistering(true);

    // verify the username is a valid email address using the zod module
    try {
      z.string().email().parse(username);
    } catch (error) {
      setErrorMessage("email");
      setIsRegistering(false);
      return;
    }
    if (passwordStrengthEvaluation.score < 4) {
      setErrorMessage("password");
      setIsRegistering(false);
      return;
    }

    try {
      // TODO the getServerChallenge should include a signature of the challenge response and be verified that it belongs to
      // the server public to make sure it wasn't tampered with
      await updateAuthentication(null);

      const clientRegistrationStartResult = client.startRegistration({
        password,
      });
      const startRegistrationResult = await startRegistrationMutation({
        input: {
          username,
          challenge: clientRegistrationStartResult.registrationRequest,
        },
      });
      if (startRegistrationResult.data?.startRegistration) {
        const { exportKey, registrationRecord, serverStaticPublicKey } =
          client.finishRegistration({
            password,
            clientRegistrationState:
              clientRegistrationStartResult.clientRegistrationState,
            registrationResponse:
              startRegistrationResult.data.startRegistration.challengeResponse,
          });
        if (serverStaticPublicKey !== getOpaqueServerPublicKey()) {
          throw new Error("Failed to register. Please contact our support.");
        }
        const {
          encryptionPrivateKey,
          signingPrivateKey,
          ciphertext: mainDeviceCiphertext,
          nonce: mainDeviceNonce,
          ...mainDevice
        } = createAndEncryptMainDevice(exportKey);

        setMainDevice({
          encryptionPrivateKey: encryptionPrivateKey,
          signingPrivateKey: signingPrivateKey,
          signingPublicKey: mainDevice.signingPublicKey,
          encryptionPublicKey: mainDevice.encryptionPublicKey,
          encryptionPublicKeySignature: mainDevice.encryptionPublicKeySignature,
          info: JSON.stringify({ type: "main" }),
        });

        let pendingWorkspaceInvitationKeySubkeyId: number | null = null;
        let pendingWorkspaceInvitationKeyCiphertext: string | null = null;
        let pendingWorkspaceInvitationKeyPublicNonce: string | null = null;
        if (props.workspaceInvitationKey) {
          const encryptedWorkspaceKeyData =
            encryptWorkspaceInvitationPrivateKey({
              exportKey,
              workspaceInvitationSigningPrivateKey:
                props.workspaceInvitationKey,
            });
          pendingWorkspaceInvitationKeySubkeyId =
            encryptedWorkspaceKeyData.subkeyId;
          pendingWorkspaceInvitationKeyCiphertext =
            encryptedWorkspaceKeyData.ciphertext;
          pendingWorkspaceInvitationKeyPublicNonce =
            encryptedWorkspaceKeyData.publicNonce;
        }

        const createChainEvent = userChain.createUserChain({
          authorKeyPair: {
            privateKey: signingPrivateKey,
            publicKey: mainDevice.signingPublicKey,
          },
          email: username,
          encryptionPublicKey: mainDevice.encryptionPublicKey,
        });

        const finishRegistrationResult = await finishRegistrationMutation({
          input: {
            registrationRecord,
            encryptedMainDevice: {
              ciphertext: mainDeviceCiphertext,
              nonce: mainDeviceNonce,
            },
            pendingWorkspaceInvitationId: props.pendingWorkspaceInvitationId,
            pendingWorkspaceInvitationKeySubkeyId,
            pendingWorkspaceInvitationKeyCiphertext,
            pendingWorkspaceInvitationKeyPublicNonce,
            serializedUserChainEvent: JSON.stringify(createChainEvent),
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

          setRegistrationInfo({
            username,
            password,
            createChainEvent,
          });
          // reset since the user might end up on this screen again
          setPassword("");
          setPasswordStrengthEvaluation(zxcvbn(""));
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

  let errorContent = "";
  if (errorMessage === "accept-tos") {
    errorContent = "Please accept the terms of service.";
  } else if (errorMessage === "email") {
    errorContent = "Please enter a valid email address.";
  } else if (errorMessage === "password") {
    errorContent =
      "Password is too weak. Please make sure to use a strong password.";
  }

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
          setPasswordStrengthEvaluation(zxcvbn(password));
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
            quiet
            muted
          >
            terms of services
          </LinkExternal>{" "}
          and{" "}
          <LinkExternal
            variant="xs"
            href="https://www.serenity.re/en/notes/privacy-policy"
            quiet
            muted
          >
            privacy policy
          </LinkExternal>
          .
        </Text>
      </Checkbox>

      {errorMessage !== "none" && errorMessage !== "password" ? (
        <InfoMessage variant="error" icon>
          {errorContent}
        </InfoMessage>
      ) : null}
      {errorMessage === "password" && passwordStrengthEvaluation.score < 4 ? (
        <InfoMessage variant="error" icon>
          <View>{errorContent}</View>
          {passwordStrengthEvaluation.feedback.suggestions.length > 0 ? (
            <>
              <View style={tw`mt-4 mb-2`}>
                <Text variant="xxs">Suggestions</Text>
              </View>
              {passwordStrengthEvaluation.feedback.suggestions.map(
                (suggestion) => (
                  <View>
                    <Text variant="xs">{suggestion}</Text>
                  </View>
                )
              )}
            </>
          ) : null}
        </InfoMessage>
      ) : null}
      <Button onPress={onRegisterPress} isLoading={isRegistering}>
        Register
      </Button>
    </FormWrapper>
  );
}
