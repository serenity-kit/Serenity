import React, { useEffect, useState } from "react";
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

export const CreateWorkspaceModal = React.forwardRef(
  (props: ModalProps, ref: any) => {
    const [name, setName] = useState<string>("");
    const [, createWorkspaceMutation] = useCreateWorkspaceMutation();

    useEffect(() => {
      setName("");
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
      <Modal
        ref={ref}
        isVisible={props.isVisible}
        onBackdropPress={props.onBackdropPress}
      >
        <View style={tw`bg-white border-gray-800 max-w-60 m-auto`}>
          <Text>Create a Workspace</Text>
          <LabeledInput label={"Workspace Name"} onChangeText={setName} />
          <Button disabled={name === ""} onPress={createWorkspace}>
            Create
          </Button>
        </View>
      </Modal>
    );
  }
);
