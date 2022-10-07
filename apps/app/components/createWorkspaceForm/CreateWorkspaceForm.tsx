import {
  createDocumentKey,
  createIntroductionDocumentSnapshot,
  encryptDocumentTitle,
  encryptFolderName,
} from "@serenity-tools/common";
import sodium from "@serenity-tools/libsodium";
import {
  Button,
  FormWrapper,
  Input,
  ModalButtonFooter,
  ModalHeader,
} from "@serenity-tools/ui";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAppContext } from "../../context/AppContext";
import {
  useCreateInitialWorkspaceStructureMutation,
  useDevicesQuery,
} from "../../generated/graphql";
import { Device } from "../../types/Device";
import { createWorkspaceKeyBoxesForDevices } from "../../utils/device/createWorkspaceKeyBoxesForDevices";

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
  onWorkspaceStructureCreated: (params: {
    workspace: WorkspaceProps;
    folder: FolderProps;
    document: DocumentProps;
  }) => void;
};

export function CreateWorkspaceForm(props: CreateWorkspaceFormProps) {
  const inputRef = useRef();
  const [name, setName] = useState<string>("");
  const { activeDevice } = useAppContext();
  const [, createInitialWorkspaceStructure] =
    useCreateInitialWorkspaceStructureMutation();

  const [devicesResult] = useDevicesQuery({
    variables: {
      hasNonExpiredSession: true,
      first: 500,
    },
  });

  useEffect(() => {
    setTimeout(() => {
      if (inputRef.current) {
        // @ts-expect-error focus() not defined since .current can be undefined
        inputRef.current.focus();
      }
    }, 250);
  }, []);

  const createWorkspace = async () => {
    if (!activeDevice) {
      throw new Error("No active device available");
    }
    const workspaceId = uuidv4();
    const folderId = uuidv4();
    const documentId = uuidv4();
    // grab all devices for this user
    //
    if (!devicesResult.data?.devices?.nodes) {
      // TODO: Handle this error
      console.error("No devices found!");
      return;
    }
    const devices = devicesResult.data?.devices?.nodes as Device[];
    const { deviceWorkspaceKeyBoxes, workspaceKey } =
      await createWorkspaceKeyBoxesForDevices({ devices, activeDevice });
    if (!workspaceKey) {
      // TODO: handle this error
      console.error("Could not retrieve workspaceKey!");
      return;
    }
    const folderName = "Getting started";
    const encryptedFolderResult = await encryptFolderName({
      name: folderName,
      parentKey: workspaceKey,
    });
    const documentName = "Introduction";
    const documentKeyData = await createDocumentKey({
      folderKey: encryptedFolderResult.folderSubkey,
    });
    const encryptedDocumentTitle = await encryptDocumentTitle({
      title: documentName,
      key: documentKeyData.key,
    });
    // currently hard-coded until we enable e2e encryption per workspace
    // const documentEncryptionKey = sodium.from_base64(
    //   "cksJKBDshtfjXJ0GdwKzHvkLxDp7WYYmdJkU1qPgM-0"
    // );
    const documentContentKeyData = await createDocumentKey({
      folderKey: encryptedFolderResult.folderSubkey,
    });
    const documentEncryptionKey = sodium.from_base64(
      documentContentKeyData.key
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
          folderId,
          encryptedFolderName: encryptedFolderResult.ciphertext,
          encryptedFolderNameNonce: encryptedFolderResult.publicNonce,
          folderSubkeyId: encryptedFolderResult.folderSubkeyId,
          folderIdSignature: `TODO+${folderId}`,
          encryptedDocumentName: encryptedDocumentTitle.ciphertext,
          encryptedDocumentNameNonce: encryptedDocumentTitle.publicNonce,
          documentSubkeyId: documentKeyData.subkeyId,
          documentContentSubkeyId: documentContentKeyData.subkeyId,
          documentId,
          documentSnapshot: snapshot,
          creatorDeviceSigningPublicKey: activeDevice?.signingPublicKey!,
          deviceWorkspaceKeyBoxes,
        },
      });
    if (
      !createInitialWorkspaceStructureResult.data
        ?.createInitialWorkspaceStructure?.workspace ||
      !createInitialWorkspaceStructureResult.data
        ?.createInitialWorkspaceStructure?.folder ||
      !createInitialWorkspaceStructureResult.data
        ?.createInitialWorkspaceStructure?.document
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
    <FormWrapper>
      <ModalHeader>Create a workspace</ModalHeader>
      <Input
        ref={inputRef}
        label={"Workspace name"}
        onChangeText={setName}
        autoFocus={true}
        hint="This is the name of your organization, team or private notes. You can invite team members afterwards."
      />
      <ModalButtonFooter
        confirm={
          <Button
            disabled={
              name === "" &&
              devicesResult.data?.devices?.nodes?.length !== undefined
            }
            onPress={createWorkspace}
          >
            Create
          </Button>
        }
      />
    </FormWrapper>
  );
}
