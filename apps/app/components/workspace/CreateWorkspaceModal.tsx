import React from "react";
import { ModalProps as ReactNativeModalProps } from "react-native-modal";
import { Modal } from "@serenity-tools/ui";
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
        onWorkspaceStructureCreated={props.onWorkspaceStructureCreated}
      />
    </Modal>
  );
}
