import React, { useState } from "react";
import {
  Text,
  View,
  Box,
  tw,
  Button,
  LabeledInput,
  InfoMessage,
} from "@serenity-tools/ui";
import { RootStackScreenProps } from "../../types/navigation";
import { useVerifyRegistrationMutation } from "../../generated/graphql";
import {
  isUsernamePasswordStored,
  getStoredUsername,
  getStoredPassword,
  deleteStoredUsernamePassword,
} from "../../utils/authentication/registrationMemoryStore";
import {
  useStartLoginMutation,
  useFinishLoginMutation,
  MainDeviceQuery,
  MainDeviceDocument,
} from "../../generated/graphql";
import { useAuthentication } from "../../context/AuthenticationContext";
import {
  login,
  fetchMainDevice,
  navigateToNextAuthenticatedPage,
} from "../../utils/authentication/loginHelper";
import { useClient } from "urql";

export default function RegistrationVerificationScreen(
  props: RootStackScreenProps<"RegistrationVerification">
) {
  const [, verifyRegistrationMutation] = useVerifyRegistrationMutation();
  const [verificationCode, setVerificationCode] = useState(
    props.route.params.verification || ""
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const { updateAuthentication } = useAuthentication();
  const [, startLoginMutation] = useStartLoginMutation();
  const [, finishLoginMutation] = useFinishLoginMutation();

  const [invalidCodeError, setInvalidCodeError] = useState(false);
  const [maxRetriesError, setMaxRetriesError] = useState(false);
  const [invalidUserError, setInvalidUserError] = useState(false);
  const urqlClient = useClient();

  const navigateToLoginScreen = () => {
    props.navigation.push("Login", {});
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
      const loginResult = await login({
        username,
        password,
        startLoginMutation,
        finishLoginMutation,
        updateAuthentication,
      });
      await fetchMainDevice({ urqlClient, exportKey: loginResult.exportKey });
      setIsLoggingIn(false);
      navigateToNextAuthenticatedPage(props.navigation);
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
      console.log({ verifyRegistrationResult });
      if (verifyRegistrationResult.error?.message) {
        console.log({ message: verifyRegistrationResult.error.message });
        const errorMessage = verifyRegistrationResult.error.message;
        setErrorMessage("");
        if (errorMessage === "[GraphQL] Invalid user") {
          setInvalidCodeError(false);
          setMaxRetriesError(false);
          setInvalidUserError(true);
        } else if (
          errorMessage === "[GraphQL] Invalid confirmation code. Code reset."
        ) {
          setInvalidCodeError(false);
          setMaxRetriesError(true);
          setInvalidUserError(false);
        } else {
          setInvalidCodeError(true);
          setMaxRetriesError(false);
          setInvalidUserError(false);
        }
        return;
      } else {
        setInvalidCodeError(false);
        setMaxRetriesError(false);
        setInvalidUserError(false);
      }
      if (isUsernamePasswordStored()) {
        await loginWithStoredUsernamePassword();
      } else {
        navigateToLoginScreen();
      }
    } catch (err) {
      console.log(err);
      setErrorMessage("Verification failed.");
    }
  };

  return (
    <View
      style={tw`bg-white xs:bg-primary-900 justify-center items-center flex-auto`}
    >
      <Box>
        <View>
          <Text variant="large" bold style={tw`text-center`}>
            Verify your Email
          </Text>
          <Text muted style={tw`text-center`}>
            Please enter the verification code{"\n"}sent to you via Email.
          </Text>
        </View>

        {errorMessage ? (
          <InfoMessage variant="error" icon>
            <Text>{errorMessage}</Text>
          </InfoMessage>
        ) : null}

        {invalidUserError ? (
          <InfoMessage variant="error" icon>
            <Text>The username you provided wasn't registered.</Text>
          </InfoMessage>
        ) : null}

        {invalidCodeError ? (
          <InfoMessage variant="error" icon>
            <Text>The verification code was wrong.</Text>
          </InfoMessage>
        ) : null}

        {maxRetriesError ? (
          <InfoMessage variant="error" icon>
            <Text>
              The code was wrong. We reset your confirmation code and sent you a
              new email. Please try again with the new code.
            </Text>
          </InfoMessage>
        ) : null}

        <LabeledInput
          label={"Verification Code"}
          value={verificationCode}
          onChangeText={(verificationCode: string) => {
            setVerificationCode(verificationCode);
          }}
          placeholder="Enter the verification code …"
        />

        <InfoMessage>
          Note: The verification code is prefilled on staging.
        </InfoMessage>

        <Button onPress={onSubmit} size="large">
          Register
        </Button>
      </Box>
    </View>
  );
}
