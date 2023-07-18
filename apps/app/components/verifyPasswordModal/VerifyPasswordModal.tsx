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
import { client } from "react-native-opaque";
import { runMeQuery, useStartLoginMutation } from "../../generated/graphql";
import { fetchMainDevice } from "../../utils/authentication/loginHelper";

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
  const [, startLoginMutation] = useStartLoginMutation();

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
      const clientLoginStartResult = client.startLogin({ password });
      const startLoginResult = await startLoginMutation({
        input: {
          username,
          challenge: clientLoginStartResult.startLoginRequest,
        },
      });
      if (!startLoginResult.data?.startLogin) {
        // probably invalid username or sessionkey
        // TODO: show this error to user
        throw new Error("Could not start login");
      }
      let finishLoginResponse;
      try {
        finishLoginResponse = client.finishLogin({
          password,
          clientLoginState: clientLoginStartResult.clientLoginState,
          loginResponse: startLoginResult.data.startLogin.challengeResponse,
        });
      } catch (error) {
        throw error;
      }

      await fetchMainDevice({ exportKey: finishLoginResponse.exportKey });

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
