import React, { useEffect, useState, useRef } from "react";
import {
  Button,
  LabeledInput,
  ModalHeader,
  ModalButtonFooter,
} from "@serenity-tools/ui";
import { useCreateInitialWorkspaceStructureMutation } from "../../generated/graphql";
import { v4 as uuidv4 } from "uuid";
import sodium from "@serenity-tools/libsodium";
import { createIntroductionDocumentSnapshot } from "@serenity-tools/common";

type WorkspaceProps = {
  id: string;
};
type FolderProps = {
  id: string;
};
type DocumentProps = {
  id: string;
};

export type CreateWorkspaceFormProps = {
  onWorkspaceStructureCreated: ({
    workspace: WorkspaceProps,
    folder: FolderProps,
    document: DocumentProps,
  }) => void;
};

export function CreateWorkspaceForm(props: CreateWorkspaceFormProps) {
  const inputRef = useRef();
  const [name, setName] = useState<string>("");
  const [, createInitialWorkspaceStructure] =
    useCreateInitialWorkspaceStructureMutation();

  useEffect(() => {
    setTimeout(() => {
      if (inputRef.current) {
        // @ts-expect-error focus() not defined since .current can be undefined
        inputRef.current.focus();
      }
    }, 250);
  }, []);

  const createWorkspace = async () => {
    const workspaceId = uuidv4();
    const folderId = uuidv4();
    const documentId = uuidv4();
    // currently hard-coded until we enable e2e encryption per workspace
    const documentEncryptionKey = sodium.from_base64(
      "cksJKBDshtfjXJ0GdwKzHvkLxDp7WYYmdJkU1qPgM-0"
    );
    const snapshot = await createIntroductionDocumentSnapshot({
      documentId,
      documentEncryptionKey,
    });

    const createInitialWorkspaceStructureResult =
      await createInitialWorkspaceStructure({
        input: {
          workspaceName: name,
          workspaceId,
          folderName: "Getting started",
          folderId,
          folderIdSignature: `TODO+${folderId}`,
          documentName: "Introduction",
          documentId,
          documentSnapshot: snapshot,
        },
      });
    if (
      !createInitialWorkspaceStructureResult.data
        ?.createInitialWorkspaceStructure?.workspace
    ) {
      // TODO: handle error
      return;
    }
    const workspace =
      createInitialWorkspaceStructureResult.data.createInitialWorkspaceStructure
        .workspace;
    const folder =
      createInitialWorkspaceStructureResult.data.createInitialWorkspaceStructure
        .folder;
    // TODO: we will have a document returned as part of this structure
    const document =
      createInitialWorkspaceStructureResult.data.createInitialWorkspaceStructure
        .document;
    if (props.onWorkspaceStructureCreated) {
      props.onWorkspaceStructureCreated({
        workspace,
        folder,
        document,
      });
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
