import React, { useEffect, useState, useRef } from "react";
import {
  Button,
  LabeledInput,
  ModalHeader,
  ModalButtonFooter,
} from "@serenity-tools/ui";
import { useCreateWorkspaceMutation } from "../../generated/graphql";
import { v4 as uuidv4 } from "uuid";

export type CreateWorkspaceFormProps = {
  onWorkspaceCreated: (workspace: { id: string }) => void;
};

export function CreateWorkspaceForm(props: CreateWorkspaceFormProps) {
  const inputRef = useRef();
  const [name, setName] = useState<string>("");
  const [, createWorkspaceMutation] = useCreateWorkspaceMutation();

  useEffect(() => {
    setTimeout(() => {
      if (inputRef.current) {
        // @ts-expect-error focus() not defined since .current can be undefined
        inputRef.current.focus();
      }
    }, 250);
  }, []);

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
    <>
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
    </>
  );
}
