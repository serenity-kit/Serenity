import React, { useState } from "react";
import { Text, View, Box, tw, Button, LabeledInput } from "@serenity-tools/ui";
import { RootStackScreenProps } from "../../types";
import { useVerifyRegistrationMutation } from "../../generated/graphql";

export default function RegistrationVerificationScreen(
  props: RootStackScreenProps<"RegistrationVerification">
) {
  const [, verifyRegistrationMutation] = useVerifyRegistrationMutation();
  const [verificationCode, setVerificationCode] = useState(
    props.route.params.verification || ""
  );
  const [errorMessage, setErrorMessage] = useState("");

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
      if (verifyRegistrationResult.data?.verifyRegistration) {
        props.navigation.push("Login", {});
      } else {
        setErrorMessage("Verification failed.");
      }
    } catch (err) {
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
          <View>
            <Text>{errorMessage}</Text>
          </View>
        ) : null}

        <LabeledInput
          label={"Verification Code"}
          value={verificationCode}
          onChangeText={(verificationCode: string) => {
            setVerificationCode(verificationCode);
          }}
          placeholder="Enter the verification code …"
        />

        <View>
          <Text>Note: The verification code is prefilled on staging.</Text>
        </View>

        <Button onPress={onSubmit} size="large">
          Register
        </Button>
      </Box>
    </View>
  );
}
