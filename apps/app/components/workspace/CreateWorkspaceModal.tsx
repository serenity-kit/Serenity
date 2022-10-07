import { Modal } from "@serenity-tools/ui";
import { ModalProps as ReactNativeModalProps } from "react-native-modal";
import {
  CreateWorkspaceForm,
  CreateWorkspaceFormProps,
} from "../createWorkspaceForm/CreateWorkspaceForm";

type ModalProps = Pick<
  ReactNativeModalProps,
  "isVisible" | "onBackdropPress" | "style"
> &
  CreateWorkspaceFormProps;

export function CreateWorkspaceModal(props: ModalProps) {
  return (
    <Modal isVisible={props.isVisible} onBackdropPress={props.onBackdropPress}>
      <CreateWorkspaceForm
        onBackdropPress={props.onBackdropPress}
        onWorkspaceStructureCreated={props.onWorkspaceStructureCreated}
      />
    </Modal>
  );
}
