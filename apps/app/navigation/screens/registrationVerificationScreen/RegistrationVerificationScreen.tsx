import { decryptWorkspaceInvitationKey } from "@serenity-tools/common";
import {
  Box,
  Button,
  Description,
  Heading,
  InfoMessage,
  Input,
  tw,
  View,
} from "@serenity-tools/ui";
import { useState } from "react";
import { Platform } from "react-native";
import { OnboardingScreenWrapper } from "../../../components/onboardingScreenWrapper/OnboardingScreenWrapper";
import { useAppContext } from "../../../context/AppContext";
import {
  runWorkspaceInvitationQuery,
  useFinishLoginMutation,
  useStartLoginMutation,
  useVerifyRegistrationMutation,
} from "../../../generated/graphql";
import { RootStackScreenProps } from "../../../types/navigationProps";
import { createDeviceWithInfo } from "../../../utils/authentication/createDeviceWithInfo";
import {
  fetchMainDevice,
  login,
  navigateToNextAuthenticatedPage,
} from "../../../utils/authentication/loginHelper";
import {
  deleteStoredUsernamePassword,
  getStoredPassword,
  getStoredUsername,
  isUsernamePasswordStored,
} from "../../../utils/authentication/registrationMemoryStore";
import { setDevice } from "../../../utils/device/deviceStore";
import { getMainDevice } from "../../../utils/device/mainDeviceMemoryStore";
import {
  removeWebDevice,
  setWebDevice,
} from "../../../utils/device/webDeviceStore";
import { removeLastUsedWorkspaceId } from "../../../utils/lastUsedWorkspaceAndDocumentStore/lastUsedWorkspaceAndDocumentStore";
import { acceptWorkspaceInvitation } from "../../../utils/workspace/acceptWorkspaceInvitation";
import { attachDeviceToWorkspaces } from "../../../utils/workspace/attachDeviceToWorkspaces";
import { getPendingWorkspaceInvitation } from "../../../utils/workspace/getPendingWorkspaceInvitation";

type VerificationError = "none" | "invalidCode" | "maxRetries" | "invalidUser";

export default function RegistrationVerificationScreen(
  props: RootStackScreenProps<"RegistrationVerification">
) {
  const [, verifyRegistrationMutation] = useVerifyRegistrationMutation();
  const [verificationCode, setVerificationCode] = useState(
    props.route.params.verification || ""
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invalidCodeError, setInvalidCodeError] = useState(false);
  const [maxRetriesError, setMaxRetriesError] = useState(false);
  const [invalidUserError, setInvalidUserError] = useState(false);
  const [verificationError, setVerificationError] =
    useState<VerificationError>("none");
  const [graphqlError, setGraphqlError] = useState("");
  const { updateAuthentication, updateActiveDevice } = useAppContext();
  const [, startLoginMutation] = useStartLoginMutation();
  const [, finishLoginMutation] = useFinishLoginMutation();

  const navigateToLoginScreen = async () => {
    await removeLastUsedWorkspaceId();
    props.navigation.push("Login");
  };

  const acceptPendingWorkspaceInvitation = async (exportKey: string) => {
    const mainDevice = getMainDevice();
    if (!mainDevice) {
      console.error("No main device found!");
      return;
    }
    const pendingWorkspaceInvitation = await getPendingWorkspaceInvitation({});
    if (pendingWorkspaceInvitation) {
      if (!exportKey) {
        // TODO: display error in UI
        console.error(
          "Unable to retrieve export key necessary for decrypting workspace invitation"
        );
        return;
      }
      if (!pendingWorkspaceInvitation.id) {
        throw new Error("pendingWorkspaceInvitation id missing");
      }
      const signingKeyPairSeed = decryptWorkspaceInvitationKey({
        exportKey,
        subkeyId: pendingWorkspaceInvitation.subkeyId!,
        ciphertext: pendingWorkspaceInvitation.ciphertext!,
        publicNonce: pendingWorkspaceInvitation.publicNonce!,
        encryptionKeySalt: pendingWorkspaceInvitation.encryptionKeySalt!,
      });
      const workspaceInvitation = await runWorkspaceInvitationQuery({
        id: pendingWorkspaceInvitation.id,
      });
      if (
        workspaceInvitation.data?.workspaceInvitation === null ||
        workspaceInvitation.data?.workspaceInvitation === undefined
      ) {
        throw new Error("workspaceInvitation is missing");
      }
      try {
        await acceptWorkspaceInvitation({
          invitationId: pendingWorkspaceInvitation.id,
          mainDevice,
          signingKeyPairSeed,
          expiresAt: workspaceInvitation.data.workspaceInvitation.expiresAt,
          invitationDataSignature:
            workspaceInvitation.data.workspaceInvitation
              .invitationDataSignature,
          invitationSigningPublicKey:
            workspaceInvitation.data.workspaceInvitation
              .invitationSigningPublicKey,
          workspaceId: workspaceInvitation.data.workspaceInvitation.workspaceId,
          role: workspaceInvitation.data.workspaceInvitation.role,
        });
      } catch (error) {
        setGraphqlError(error.message);
      }
    }
  };

  const loginWithStoredUsernamePassword = async () => {
    const username = getStoredUsername();
    const password = getStoredPassword();
    deleteStoredUsernamePassword();
    if (!username || !password) {
      navigateToLoginScreen();
      return;
    }
    try {
      setErrorMessage("");

      const unsafedDevice = createDeviceWithInfo();

      // FIXME: allow non-extended login by storing into sessionStorage
      // for now this is a HACK to support devices and workspaceKeyBoxes
      const useExtendedLogin = true;

      const loginResult = await login({
        username,
        password,
        startLoginMutation,
        finishLoginMutation,
        updateAuthentication,
        device: unsafedDevice,
        useExtendedLogin,
      });
      const exportKey = loginResult.result.exportKey;
      await fetchMainDevice({
        exportKey,
      });

      if (Platform.OS === "web") {
        await removeWebDevice();
        await setWebDevice(unsafedDevice, useExtendedLogin);
        await updateActiveDevice();
      } else if (Platform.OS === "ios") {
        if (useExtendedLogin) {
          await setDevice(unsafedDevice);
          await updateActiveDevice();
        }
      }
      try {
        await attachDeviceToWorkspaces({
          activeDevice: unsafedDevice,
        });
      } catch (error) {
        // TOOD: handle error
        console.error(error);
        return;
      }
      await acceptPendingWorkspaceInvitation(exportKey);
      navigateToNextAuthenticatedPage({
        navigation: props.navigation,
        pendingWorkspaceInvitationId: null,
      });
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to login.");
    }
  };

  const onSubmit = async () => {
    if (!props.route.params.username) {
      setErrorMessage("Something went wrong. Email is missing.");
      return;
    }
    try {
      setIsSubmitting(true);
      const verifyRegistrationResult = await verifyRegistrationMutation({
        input: {
          username: props.route.params.username,
          verificationCode,
        },
      });
      if (!verifyRegistrationResult.data?.verifyRegistration) {
        setErrorMessage("");
        const errorMessage = verifyRegistrationResult.error?.message;
        if (errorMessage === "[GraphQL] Invalid user") {
          setVerificationError("invalidUser");
        } else if (
          errorMessage === "[GraphQL] Too many attempts. Code reset."
        ) {
          setVerificationError("maxRetries");
        } else {
          setVerificationError("invalidCode");
        }
        return;
      } else {
        setVerificationError("none");
      }
      if (isUsernamePasswordStored()) {
        await loginWithStoredUsernamePassword();
      } else {
        navigateToLoginScreen();
      }
    } catch (err) {
      setErrorMessage("Verification failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingScreenWrapper>
      <Box plush>
        <View>
          <Heading lvl={1} center padded>
            Verify your email
          </Heading>
          <Description variant="login" style={tw`text-center`}>
            Please enter the verification code{"\n"}sent to you via email.
          </Description>
        </View>

        {graphqlError !== "" && (
          <InfoMessage variant="error">{graphqlError}</InfoMessage>
        )}

        {errorMessage ? (
          <InfoMessage variant="error" icon>
            {errorMessage}
          </InfoMessage>
        ) : null}

        {verificationError === "invalidCode" && (
          <InfoMessage
            variant="error"
            icon
            testID="verify-registration__invalidCodeError"
          >
            The verification code was wrong.
          </InfoMessage>
        )}

        {verificationError === "invalidUser" && (
          <InfoMessage
            variant="error"
            icon
            testID="verify-registration__invalidUserError"
          >
            The username you provided wasn't registered.
          </InfoMessage>
        )}

        {verificationError === "maxRetries" && (
          <InfoMessage
            variant="error"
            icon
            testID="verify-registration__maxRetriesError"
          >
            The code was wrong. We reset your confirmation code and sent you a
            new email. Please try again with the new code.
          </InfoMessage>
        )}

        <Input
          label={"Verification code"}
          value={verificationCode}
          onChangeText={(verificationCode: string) => {
            setVerificationCode(verificationCode);
          }}
          placeholder="Enter the verification code …"
          testID="verify-registration__input"
        />

        <InfoMessage>
          Note: The verification code is prefilled on staging.
        </InfoMessage>

        <Button
          onPress={onSubmit}
          isLoading={isSubmitting}
          testID="verify-registration__button"
        >
          Register
        </Button>
      </Box>
    </OnboardingScreenWrapper>
  );
}
