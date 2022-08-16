import { createIntroductionDocumentSnapshot } from "@serenity-tools/common";
import sodium from "@serenity-tools/libsodium";
import {
  Button,
  FormWrapper,
  LabeledInput,
  ModalButtonFooter,
  ModalHeader,
} from "@serenity-tools/ui";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  useCreateInitialWorkspaceStructureMutation,
  useDevicesQuery,
} from "../../generated/graphql";
import { Device } from "../../types/Device";
import { createWorkspaceKeyAndCipherTextForDevice } from "../../utils/device/createWorkspaceKeyAndCipherTextForDevice";
import { getActiveDevice } from "../../utils/device/getActiveDevice";
import { getMainDevice } from "../../utils/device/mainDeviceMemoryStore";

type DeviceWorkspaceKeyBoxParams = {
  deviceSigningPublicKey: string;
  creatorDeviceSigningPublicKey: string;
  nonce: string;
  ciphertext: string;
};

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

  const [devicesResult] = useDevicesQuery({
    variables: {
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

  const buildDeviceWorkspaceKeyBoxes = async (devices: Device[]) => {
    const deviceWorkspaceKeyBoxes: DeviceWorkspaceKeyBoxParams[] = [];
    const allDevices = devices;
    const mainDevice = getMainDevice();
    const activeDevice = await getActiveDevice();
    if (!activeDevice) {
      // TODO: handle this error
      console.error("No active device!");
    }
    if (mainDevice) {
      allDevices.push(mainDevice);
    }
    for await (const device of allDevices) {
      const { nonce, ciphertext } =
        await createWorkspaceKeyAndCipherTextForDevice({
          receiverDeviceEncryptionPublicKey: device.encryptionPublicKey,
          creatorDeviceEncryptionPrivateKey:
            activeDevice?.encryptionPrivateKey!,
        });
      deviceWorkspaceKeyBoxes.push({
        deviceSigningPublicKey: device.signingPublicKey,
        creatorDeviceSigningPublicKey: activeDevice?.signingPublicKey!,
        nonce,
        ciphertext,
      });
    }
    return deviceWorkspaceKeyBoxes;
  };

  const createWorkspace = async () => {
    console.log("createWorkspace");
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

    // grab all devices for this user
    //
    if (!devicesResult.data?.devices?.nodes) {
      // TODO: Handle this error
      console.error("No devices found!");
      return;
    }
    const devices = devicesResult.data?.devices?.nodes as Device[];
    const deviceWorkspaceKeyBoxes = await buildDeviceWorkspaceKeyBoxes(devices);
    console.log({ deviceWorkspaceKeyBoxes });
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
          deviceWorkspaceKeyBoxes,
        },
      });
    console.log({ createInitialWorkspaceStructureResult });
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
