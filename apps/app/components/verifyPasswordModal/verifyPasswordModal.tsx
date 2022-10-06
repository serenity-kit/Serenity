import { Button, Input, Modal, ModalHeader, Text } from "@serenity-tools/ui";
import { useState } from "react";
import { fetchMainDevice } from "../../utils/authentication/loginHelper";

export type Props = {
  isVisible: boolean;
  description: string;
  onSuccess?: () => void;
  onFail?: () => void;
  onCancel?: () => void;
};
export function VerifyPasswordModal(props: Props) {
  const [password, setPassword] = useState("");
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);

  const onBackdropPress = () => {
    if (props.onCancel) {
      props.onCancel();
    }
  };

  const onVerifyPasswordPress = async () => {
    setIsVerifyingPassword(true);
    // TODO: create a method that verifies the password
    try {
      await fetchMainDevice({ exportKey: "" });
      if (props.onSuccess) {
        props.onSuccess();
      }
    } catch (error) {
      if (props.onFail) {
        props.onFail();
      }
    }
    setIsVerifyingPassword(false);
  };

  return (
    <Modal isVisible={props.isVisible} onBackdropPress={onBackdropPress}>
      <ModalHeader>Verify Password</ModalHeader>
      <Input
        label={"Password"}
        secureTextEntry
        value={password}
        onChangeText={(password: string) => {
          setPassword(password);
        }}
        placeholder="Enter your password …"
      />
      <Text muted>{props.description}</Text>
      <Button onPress={onVerifyPasswordPress} disabled={isVerifyingPassword}>
        Verify
      </Button>
    </Modal>
  );
}
