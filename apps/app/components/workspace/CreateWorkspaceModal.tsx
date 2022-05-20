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
  onWorkspaceCreated: (workspace: any) => void;
};

export const CreateWorkspaceModal = React.forwardRef(
  ({ ...rest }: ModalProps, ref: any) => {
    const [name, setName] = useState<string>("");
    const [, createWorkspaceMutation] = useCreateWorkspaceMutation();

    useEffect(() => {
      setName("");
    }, [rest.isVisible]);

    const createWorkspace = async () => {
      // TODO: make sure the name doesn't already exist
      const id = uuidv4();
      const createWorkspaceResult = await createWorkspaceMutation({
        input: {
          name,
          id,
        },
      });
      if (
        createWorkspaceResult.data &&
        createWorkspaceResult.data.createWorkspace
      ) {
        const workspace = createWorkspaceResult.data.createWorkspace.workspace;
        if (rest.onWorkspaceCreated) {
          rest.onWorkspaceCreated(workspace);
        }
      }
    };

    return (
      <Modal isVisible={rest.isVisible} onBackdropPress={rest.onBackdropPress}>
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
