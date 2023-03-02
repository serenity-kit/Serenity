import {
  Button,
  Checkbox,
  FormWrapper,
  InfoMessage,
  Input,
  Text,
} from "@serenity-tools/ui";
import { useEffect, useState } from "react";
import { Platform, useWindowDimensions } from "react-native";
import { z } from "zod";
import { useAppContext } from "../../context/AppContext";
import {
  useFinishLoginMutation,
  useStartLoginMutation,
} from "../../generated/graphql";
import { clearDeviceAndSessionStorage } from "../../utils/authentication/clearDeviceAndSessionStorage";
import { createDeviceWithInfo } from "../../utils/authentication/createDeviceWithInfo";
import { fetchMainDevice, login } from "../../utils/authentication/loginHelper";
import { setDevice } from "../../utils/device/deviceStore";
import {
  removeWebDevice,
  setWebDevice,
} from "../../utils/device/webDeviceStore";
import { attachDeviceToWorkspaces } from "../../utils/workspace/attachDeviceToWorkspaces";
import { userWorkspaceKeyStore } from "../../utils/workspace/workspaceKeyStore";

type Props = {
  onLoginSuccess?: () => void;
  isFocused: boolean;
};

export function LoginForm(props: Props) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [useExtendedLogin, setUseExtendedLogin] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [gqlErrorMessage, setGqlErrorMessage] = useState("");
  const { updateAuthentication, updateActiveDevice } = useAppContext();
  const [, startLoginMutation] = useStartLoginMutation();
  const [, finishLoginMutation] = useFinishLoginMutation();
  const clearWorkspaceKeyStore = userWorkspaceKeyStore((state) => state.clear);

  // we want to reset the form when the user navigates away from the screen
  // to avoid having the form filled and potentially allowing someone else to
  // steal the login data with brief access to the client
  useEffect(() => {
    if (!props.isFocused) {
      setUsername("");
      setPassword("");
      setGqlErrorMessage("");
      setIsLoggingIn(false);
    }
  }, [props.isFocused]);

  const onLoginPress = async () => {
    // verify the username is a valid email address using the zod module
    try {
      z.string().email().parse(username);
    } catch (error) {
      setGqlErrorMessage("Invalid email address");
      setIsLoggingIn(false);
      return;
    }
    try {
      z.string().min(6).parse(password);
    } catch (error) {
      setGqlErrorMessage("Password must be at least 6 characters");
      setIsLoggingIn(false);
      return;
    }

    try {
      setGqlErrorMessage("");
      setIsLoggingIn(true);
      await clearDeviceAndSessionStorage(clearWorkspaceKeyStore);
      const unsavedDevice = createDeviceWithInfo();
      const loginResult = await login({
        username,
        password,
        startLoginMutation,
        finishLoginMutation,
        updateAuthentication,
        device: unsavedDevice,
        useExtendedLogin,
      });
      const exportKey = loginResult.result.exportKey;
      // reset the password in case the user ends up on this screen again
      await fetchMainDevice({ exportKey });
      if (Platform.OS === "web") {
        await removeWebDevice();
        await setWebDevice(unsavedDevice, useExtendedLogin);
        await updateActiveDevice();
      } else if (Platform.OS === "ios") {
        if (useExtendedLogin) {
          await setDevice(unsavedDevice);
          await updateActiveDevice();
        }
      }
      try {
        await attachDeviceToWorkspaces({
          activeDevice: unsavedDevice,
        });
      } catch (error) {
        console.error(error);
        setGqlErrorMessage(
          "Successfully logged in, but failed to active the session. Please try again."
        );
        setIsLoggingIn(false);
        return;
      }

      setPassword("");
      setUsername("");
      setIsLoggingIn(false);
      if (props.onLoginSuccess) {
        props.onLoginSuccess();
      }
    } catch (error) {
      console.error(error);
      setGqlErrorMessage(
        "Failed to login due incorrect credentials or a network issue. Please try again."
      );
      setIsLoggingIn(false);
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
      {Platform.OS === "web" && (
        <Checkbox
          value={"useExtendedLogin"}
          isChecked={useExtendedLogin}
          onChange={setUseExtendedLogin}
          accessibilityLabel="This is a remember-my login checkbox"
        >
          <Text variant="xs" muted>
            Stay logged in for 30 days
          </Text>
        </Checkbox>
      )}

      {gqlErrorMessage !== "" ? (
        <InfoMessage variant="error" icon>
          {gqlErrorMessage}
        </InfoMessage>
      ) : null}

      <Button onPress={onLoginPress} isLoading={isLoggingIn}>
        Log in
      </Button>
    </FormWrapper>
  );
}
