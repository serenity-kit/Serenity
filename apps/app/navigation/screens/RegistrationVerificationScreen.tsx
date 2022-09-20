import {
  Box,
  Button,
  InfoMessage,
  Input,
  Text,
  tw,
  View,
} from "@serenity-tools/ui";
import { useState } from "react";
import { Platform } from "react-native";
import { useClient } from "urql";
import { OnboardingScreenWrapper } from "../../components/onboardingScreenWrapper/OnboardingScreenWrapper";
import { useAppContext } from "../../context/AppContext";
import {
  useAcceptWorkspaceInvitationMutation,
  useFinishLoginMutation,
  useStartLoginMutation,
  useVerifyRegistrationMutation,
} from "../../generated/graphql";
import { RootStackScreenProps } from "../../types/navigation";
import { createDeviceWithInfo } from "../../utils/authentication/createDeviceWithInfo";
import {
  fetchMainDevice,
  login,
  navigateToNextAuthenticatedPage,
} from "../../utils/authentication/loginHelper";
import {
  deleteStoredUsernamePassword,
  getStoredPassword,
  getStoredUsername,
  isUsernamePasswordStored,
} from "../../utils/authentication/registrationMemoryStore";
import { setDevice } from "../../utils/device/deviceStore";
import {
  removeWebDevice,
  setWebDevice,
} from "../../utils/device/webDeviceStore";
import { removeLastUsedWorkspaceId } from "../../utils/lastUsedWorkspaceAndDocumentStore/lastUsedWorkspaceAndDocumentStore";
import { acceptWorkspaceInvitation } from "../../utils/workspace/acceptWorkspaceInvitation";
import { attachDeviceToWorkspaces } from "../../utils/workspace/attachDeviceToWorkspaces";
import { getPendingWorkspaceInvitationId } from "../../utils/workspace/getPendingWorkspaceInvitationId";

export default function RegistrationVerificationScreen(
  props: RootStackScreenProps<"RegistrationVerification">
) {
  const [, verifyRegistrationMutation] = useVerifyRegistrationMutation();
  const [verificationCode, setVerificationCode] = useState(
    props.route.params.verification || ""
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [graphqlError, setGraphqlError] = useState("");
  const { updateAuthentication, updateActiveDevice } = useAppContext();
  const [, startLoginMutation] = useStartLoginMutation();
  const [, finishLoginMutation] = useFinishLoginMutation();
  const [, acceptWorkspaceInvitationMutation] =
    useAcceptWorkspaceInvitationMutation();
  const urqlClient = useClient();

  const navigateToLoginScreen = async () => {
    await removeLastUsedWorkspaceId();
    props.navigation.push("Login", {});
  };

  const acceptPendingWorkspaceInvitation = async () => {
    const pendingWorkspaceInvitationId = await getPendingWorkspaceInvitationId({
      urqlClient,
    });
    if (pendingWorkspaceInvitationId) {
      try {
        await acceptWorkspaceInvitation({
          workspaceInvitationId: pendingWorkspaceInvitationId,
          acceptWorkspaceInvitationMutation,
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
      setIsLoggingIn(true);

      const unsafedDevice = await createDeviceWithInfo();

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
        urqlClient,
        useExtendedLogin,
      });
      await fetchMainDevice({ urqlClient, exportKey: loginResult.exportKey });

      if (Platform.OS === "web") {
        if (!useExtendedLogin) {
          await removeWebDevice();
        }
        await setWebDevice(unsafedDevice, useExtendedLogin);
        await updateActiveDevice();
      } else if (Platform.OS === "ios") {
        if (useExtendedLogin) {
          await setDevice(unsafedDevice);
          await updateActiveDevice();
        }
      }
      try {
        await attachDeviceToWorkspaces({ urqlClient });
      } catch (error) {
        // TOOD: handle error
        console.error(error);
        return;
      }

      await acceptPendingWorkspaceInvitation();
      setIsLoggingIn(false);
      navigateToNextAuthenticatedPage({
        navigation: props.navigation,
        pendingWorkspaceInvitationId: null,
      });
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to login.");
      setIsLoggingIn(false);
    }
  };

  const onSubmit = async () => {
    if (!props.route.params.username) {
      setErrorMessage("Something went wrong. Email is missing.");
      return;
    }
    try {
      const verifyRegistrationResult = await verifyRegistrationMutation({
        input: {
          username: props.route.params.username,
          verificationCode,
        },
      });
      if (!verifyRegistrationResult.data?.verifyRegistration) {
        setErrorMessage("Verification failed.");
        return;
      }
      if (isUsernamePasswordStored()) {
        await loginWithStoredUsernamePassword();
      } else {
        navigateToLoginScreen();
      }
    } catch (err) {
      setErrorMessage("Verification failed.");
    }
  };

  return (
    <OnboardingScreenWrapper>
      <Box plush>
        <View>
          <Text variant="lg" bold style={tw`text-center`}>
            Verify your email
          </Text>
          <Text muted style={tw`text-center`}>
            Please enter the verification code{"\n"}sent to you via email.
          </Text>
        </View>

        {graphqlError !== "" && (
          <InfoMessage variant="error">{graphqlError}</InfoMessage>
        )}

        {errorMessage ? (
          <InfoMessage variant="error" icon>
            {errorMessage}
          </InfoMessage>
        ) : null}

        <Input
          label={"Verification code"}
          value={verificationCode}
          onChangeText={(verificationCode: string) => {
            setVerificationCode(verificationCode);
          }}
          placeholder="Enter the verification code …"
        />

        <InfoMessage>
          Note: The verification code is prefilled on staging.
        </InfoMessage>

        <Button onPress={onSubmit}>Register</Button>
      </Box>
    </OnboardingScreenWrapper>
  );
}
