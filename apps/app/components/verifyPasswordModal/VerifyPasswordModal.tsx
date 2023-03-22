import { finishLogin, startLogin } from "@serenity-tools/opaque";
import {
  Button,
  Description,
  FormWrapper,
  InfoMessage,
  Input,
  Modal,
  ModalButtonFooter,
  ModalHeader,
  View,
} from "@serenity-tools/ui";
import { useEffect, useRef, useState } from "react";
import { TextInput } from "react-native";
import sodium from "react-native-libsodium";
import {
  MainDeviceDocument,
  MainDeviceQuery,
  runMeQuery,
  useStartLoginMutation,
  useVerifyPasswordMutation,
} from "../../generated/graphql";
import { useAuthenticatedAppContext } from "../../hooks/useAuthenticatedAppContext";
import { setMainDevice } from "../../utils/device/mainDeviceMemoryStore";
import { getUrqlClient } from "../../utils/urqlClient/urqlClient";

export type Props = {
  isVisible: boolean;
  description: string;
  onSuccess: () => void;
  onCancel: () => void;
};
export function VerifyPasswordModal(props: Props) {
  const inputRef = useRef<TextInput>();
  const [password, setPassword] = useState("");
  const [isPasswordInvalid, setIsPasswordInvalid] = useState(false);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const { activeDevice, sessionKey } = useAuthenticatedAppContext();
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
        inputRef.current.focus();
      }
    }, 250);
  }, []);

  const cancel = () => {
    if (props.onCancel) {
      props.onCancel();
    }
  };

  const onVerifyPasswordPress = async (password: string) => {
    setIsPasswordInvalid(false);
    setIsVerifyingPassword(true);
    // TODO: create a method that verifies the password
    try {
      const meResult = await runMeQuery({});
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
      let finishLoginResponse: any = undefined;
      try {
        finishLoginResponse = await finishLogin(
          password,
          startLoginResult.data.startLogin.challengeResponse
        );
      } catch (error) {
        throw error;
      }
      const sessionTokenSignature = sodium.crypto_sign_detached(
        sessionKey,
        sodium.from_base64(activeDevice.signingPrivateKey!)
      );
      const verifyPasswordResponse = await verifyPasswordMutation({
        input: {
          loginId: startLoginResult.data.startLogin.loginId,
          message: finishLoginResponse.response,
          deviceSigningPublicKey: activeDevice.signingPublicKey,
          sessionTokenSignature: sodium.to_base64(sessionTokenSignature),
        },
      });
      if (verifyPasswordResponse.error) {
        throw new Error(verifyPasswordResponse.error.message);
      }
      const isPasswordValid =
        verifyPasswordResponse.data?.verifyPassword?.isValid;
      if (isPasswordValid !== true) {
        throw new Error("Password is not valid");
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
      // @ts-expect-error TODO invesigate this!!!
      setMainDevice(mainDevice);
      if (props.onSuccess) {
        props.onSuccess();
      }
      setPassword("");
      setIsVerifyingPassword(false);
    } catch (error) {
      setIsPasswordInvalid(true);
      setIsVerifyingPassword(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  return (
    <Modal
      isVisible={props.isVisible}
      onBackdropPress={cancel}
      onModalHide={onModalHide}
    >
      <View testID="verify-password-modal">
        <FormWrapper>
          <ModalHeader>Verify Password</ModalHeader>
          <Description variant="modal">{props.description}</Description>
          <Input
            ref={inputRef}
            label={"Password"}
            secureTextEntry
            value={password}
            onChangeText={(text: string) => {
              setPassword(text);
            }}
            placeholder="Enter your password …"
            testID="verify-password-modal__password-input"
          />
          {isPasswordInvalid && (
            <InfoMessage variant="error">Invalid password</InfoMessage>
          )}
          <ModalButtonFooter
            confirm={
              <Button
                onPress={() => onVerifyPasswordPress(password)}
                isLoading={isVerifyingPassword}
                testID="verify-password-modal__submit-button"
              >
                Verify
              </Button>
            }
            cancel={
              <Button
                onPress={() => {
                  cancel();
                }}
                variant="secondary"
                disabled={isVerifyingPassword}
              >
                Cancel
              </Button>
            }
          />
        </FormWrapper>
      </View>
    </Modal>
  );
}
