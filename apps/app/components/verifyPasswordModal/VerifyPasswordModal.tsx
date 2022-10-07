import sodium from "@serenity-tools/libsodium";
import { finishLogin, startLogin } from "@serenity-tools/opaque";
import {
  Button,
  InfoMessage,
  Input,
  Modal,
  ModalHeader,
  Text,
} from "@serenity-tools/ui";
import { useEffect, useRef, useState } from "react";
import {
  MainDeviceDocument,
  MainDeviceQuery,
  useStartLoginMutation,
  useVerifyPasswordMutation,
} from "../../generated/graphql";
import { fetchMe } from "../../graphql/fetchUtils/fetchMe";
import { getSessionKey } from "../../utils/authentication/sessionKeyStore";
import { getActiveDevice } from "../../utils/device/getActiveDevice";
import { setMainDevice } from "../../utils/device/mainDeviceMemoryStore";
import { getUrqlClient } from "../../utils/urqlClient/urqlClient";

export type Props = {
  isVisible: boolean;
  description: string;
  onSuccess?: () => void;
  onBackdropPress?: () => void;
};
export function VerifyPasswordModal(props: Props) {
  const inputRef = useRef();
  const [password, setPassword] = useState("");
  const [isPasswordInvalid, setIsPasswordInvalid] = useState(false);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const [, startLoginMutation] = useStartLoginMutation();
  const [, verifyPasswordMutation] = useVerifyPasswordMutation();

  const onModalHide = () => {
    setPassword("");
    setIsPasswordInvalid(false);
    setIsVerifyingPassword(false);
  };

  useEffect(() => {
    setTimeout(() => {
      if (inputRef.current) {
        // @ts-expect-error focus() not defined since .current can be undefined
        inputRef.current.focus();
      }
    }, 250);
  }, []);

  const onBackdropPress = () => {
    setPassword("");
    if (props.onBackdropPress) {
      props.onBackdropPress();
    }
  };

  const onVerifyPasswordPress = async (password: string) => {
    setIsPasswordInvalid(false);
    setIsVerifyingPassword(true);
    // TODO: create a method that verifies the password
    try {
      const meResult = await fetchMe();
      if (meResult.error) {
        // TODO: handle this error in the UI
        throw new Error(meResult.error.message);
      }
      if (!meResult.data?.me) {
        // TODO: handle this error in the UI
        throw new Error("Could not query me. Probably not logged in");
      }
      const username = meResult.data.me.username;
      let message: any = undefined;
      message = await startLogin(password);
      const startLoginResult = await startLoginMutation({
        input: {
          username,
          challenge: message,
        },
      });
      if (!startLoginResult.data?.startLogin) {
        // probably invalid username or sessionkey
        // TODO: show this error to user
        throw new Error("Could not start login");
      }
      const sessionKey = await getSessionKey();
      if (!sessionKey) {
        // TODO: handle this error in the UI
        throw new Error("No session key found!");
      }
      const activeDevice = await getActiveDevice();
      if (!activeDevice) {
        // TODO: handle this error in the UI
        throw new Error("No active device found!");
      }
      let finishLoginResponse: any = undefined;
      try {
        finishLoginResponse = await finishLogin(
          startLoginResult.data.startLogin.challengeResponse
        );
      } catch (error) {
        setIsPasswordInvalid(true);
        setIsVerifyingPassword(false);
        return;
      }
      const sessionTokenSignature = await sodium.crypto_sign_detached(
        sessionKey,
        activeDevice.signingPrivateKey!
      );
      const verifyPasswordResponse = await verifyPasswordMutation({
        input: {
          loginId: startLoginResult.data.startLogin.loginId,
          message: finishLoginResponse.response,
          deviceSigningPublicKey: activeDevice.signingPublicKey,
          sessionTokenSignature,
        },
      });
      if (verifyPasswordResponse.error) {
        // TODO: handle this error in the UI
        setIsPasswordInvalid(true);
        setIsVerifyingPassword(false);
        throw new Error(verifyPasswordResponse.error.message);
      }
      const isPasswordValid =
        verifyPasswordResponse.data?.verifyPassword?.isValid;
      if (isPasswordValid !== true) {
        // password is not valid.
        // TODO: alert user and let them retype password?
        setIsPasswordInvalid(true);
        setIsVerifyingPassword(false);
        return;
      }
      // verify login
      const mainDeviceResult = await getUrqlClient()
        .query<MainDeviceQuery>(MainDeviceDocument, undefined, {
          requestPolicy: "network-only",
        })
        .toPromise();
      if (mainDeviceResult.error) {
        // TODO: handle this error in the UI
        throw new Error(mainDeviceResult.error.message);
      }
      if (!mainDeviceResult.data?.mainDevice) {
        // TODO: handle this error in the UI
        throw new Error("Could not query mainDevice. Probably not logged in");
      }
      const mainDevice = mainDeviceResult.data.mainDevice;
      setMainDevice(mainDevice);
      if (props.onSuccess) {
        props.onSuccess();
      }
    } catch (error) {
      setIsPasswordInvalid(true);
    }
    setPassword("");
    setIsVerifyingPassword(false);
  };

  return (
    <Modal
      isVisible={props.isVisible}
      onBackdropPress={onBackdropPress}
      onModalHide={onModalHide}
    >
      <ModalHeader>Verify Password</ModalHeader>
      {isPasswordInvalid && (
        <InfoMessage variant="error">Invalid password</InfoMessage>
      )}
      <Input
        ref={inputRef}
        autoFocus={true}
        label={"Password"}
        secureTextEntry
        value={password}
        onChangeText={(text: string) => {
          setPassword(text);
        }}
        placeholder="Enter your password …"
      />
      <Text muted variant="sm">
        {props.description}
      </Text>
      <Button
        onPress={() => onVerifyPasswordPress(password)}
        disabled={isVerifyingPassword}
      >
        Verify
      </Button>
    </Modal>
  );
}
