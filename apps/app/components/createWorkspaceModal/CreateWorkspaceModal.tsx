import React, { useEffect, useState, useRef } from "react";
import { ModalProps as ReactNativeModalProps } from "react-native-modal";
import {
  Button,
  LabeledInput,
  Modal,
  ModalHeader,
  ModalButtonFooter,
} from "@serenity-tools/ui";
import { useCreateWorkspaceMutation } from "../../generated/graphql";
import { v4 as uuidv4 } from "uuid";

type ModalProps = Pick<
  ReactNativeModalProps,
  "isVisible" | "onBackdropPress" | "style"
> & {
  onWorkspaceCreated: (workspace: { id: string }) => void;
};

export function CreateWorkspaceModal(props: ModalProps) {
  const inputRef = useRef();
  const [name, setName] = useState<string>("");
  const [, createWorkspaceMutation] = useCreateWorkspaceMutation();

  useEffect(() => {
    setName("");
    setTimeout(() => {
      if (props.isVisible && inputRef.current) {
        // @ts-expect-error focus() not defined since .current can be undefined
        inputRef.current.focus();
      }
    }, 250);
  }, [props.isVisible]);

  const createWorkspace = async () => {
    const id = uuidv4();
    const createWorkspaceResult = await createWorkspaceMutation({
      input: {
        name,
        id,
      },
    });
    if (
      createWorkspaceResult.data?.createWorkspace?.workspace &&
      props.onWorkspaceCreated
    ) {
      const workspace = createWorkspaceResult.data.createWorkspace.workspace;
      props.onWorkspaceCreated({ id: workspace.id });
    }
  };

  return (
    <Modal isVisible={props.isVisible} onBackdropPress={props.onBackdropPress}>
      <ModalHeader>Create a Workspace</ModalHeader>
      <LabeledInput
        ref={inputRef}
        label={"Workspace Name"}
        onChangeText={setName}
        autoFocus={true}
        hint="This is the name of your organization, team or private notes. You can invite team members afterwards."
      />
      <ModalButtonFooter
        confirm={
          <Button disabled={name === ""} onPress={createWorkspace}>
            Create
          </Button>
        }
      />
    </Modal>
  );
}
