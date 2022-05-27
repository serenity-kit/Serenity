import React, { useEffect, useState, useRef } from "react";
import { ModalProps as ReactNativeModalProps } from "react-native-modal";
import {
  Button,
  Text,
  tw,
  View,
  LabeledInput,
  Modal,
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
      <View style={tw`bg-white border-gray-800 max-w-60 m-auto`}>
        <Text>Create a Workspace</Text>
        <LabeledInput
          ref={inputRef}
          label={"Workspace Name"}
          onChangeText={setName}
          autoFocus={true}
        />
        <Button disabled={name === ""} onPress={createWorkspace}>
          Create
        </Button>
      </View>
    </Modal>
  );
}
