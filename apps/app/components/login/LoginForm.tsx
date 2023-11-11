import {
  Button,
  Checkbox,
  FormWrapper,
  InfoMessage,
  Input,
  Text,
} from "@serenity-tools/ui";
import { useEffect, useState } from "react";
import { useWindowDimensions } from "react-native";
import { z } from "zod";
import { useAppContext } from "../../context/AppContext";
import { setDevice } from "../../store/deviceStore/deviceStore";
import {
  persistWebDeviceAccess,
  removeWebDeviceAccess,
} from "../../store/webDeviceStore";
import { clearDeviceAndSessionStores } from "../../utils/authentication/clearDeviceAndSessionStores";
import { login } from "../../utils/authentication/loginHelper";
import { OS } from "../../utils/platform/platform";
import { attachDeviceToWorkspaces } from "../../utils/workspace/attachDeviceToWorkspaces";

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
      await clearDeviceAndSessionStores();
      const loginResult = await login({
        username,
        password,
        updateAuthentication,
        useExtendedLogin,
      });
      const unsavedDevice = loginResult.device;
      // reset the password in case the user ends up on this screen again
      if (OS === "web") {
        await removeWebDeviceAccess();
        // should always be available in this case
        if (loginResult.webDeviceAccessToken && loginResult.webDeviceKey) {
          await persistWebDeviceAccess({
            accessToken: loginResult.webDeviceAccessToken,
            key: loginResult.webDeviceKey,
          });
        }
        await updateActiveDevice();
      } else if (OS === "ios" || OS === "electron") {
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
      {OS === "web" && (
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
