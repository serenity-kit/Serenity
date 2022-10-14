import { Modal } from "@serenity-tools/ui";
import { ModalProps as ReactNativeModalProps } from "react-native-modal";
import {
  CreateWorkspaceForm,
  CreateWorkspaceFormProps,
} from "../createWorkspaceForm/CreateWorkspaceForm";

type ModalProps = Pick<ReactNativeModalProps, "isVisible" | "style"> &
  CreateWorkspaceFormProps;

export function CreateWorkspaceModal(props: ModalProps) {
  return (
    <Modal
      isVisible={props.isVisible}
      onBackdropPress={() => {
        if (props.onCancel) {
          props.onCancel();
        }
      }}
    >
      <CreateWorkspaceForm
        onCancel={props.onCancel}
        onWorkspaceStructureCreated={props.onWorkspaceStructureCreated}
      />
    </Modal>
  );
}
