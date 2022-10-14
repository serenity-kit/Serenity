import { useNavigation } from "@react-navigation/native";
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
import { TextInput } from "react-native";
import { v4 as uuidv4 } from "uuid";
import { useAppContext } from "../../context/AppContext";
import {
  useCreateInitialWorkspaceStructureMutation,
  useDevicesQuery,
} from "../../generated/graphql";
import { Device } from "../../types/Device";
import { createWorkspaceKeyBoxesForDevices } from "../../utils/device/createWorkspaceKeyBoxesForDevices";
import { getMainDevice } from "../../utils/device/mainDeviceMemoryStore";
import { VerifyPasswordModal } from "../verifyPasswordModal/VerifyPasswordModal";

export type CreateWorkspaceFormProps = {
  onBackdropPress?: () => void;
  onWorkspaceStructureCreated?: () => void;
};

export function CreateWorkspaceForm(props: CreateWorkspaceFormProps) {
  const inputRef = useRef<TextInput>();
  const [name, setName] = useState<string>("");
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const { activeDevice } = useAppContext();
  const navigation = useNavigation();
  const [, createInitialWorkspaceStructure] =
    useCreateInitialWorkspaceStructureMutation();

  const [devicesResult] = useDevicesQuery({
    variables: {
      hasNonExpiredSession: true,
      first: 500,
    },
  });

  useEffect(() => {
    // the password input field doesn't work in case we activate the modal
    // in the useState call
    const mainDevice = getMainDevice();
    if (!mainDevice) {
      setIsPasswordModalVisible(true);
    } else {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 250);
    }
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
    const document =
      createInitialWorkspaceStructureResult.data.createInitialWorkspaceStructure
        .document;

    navigation.navigate("Workspace", {
      workspaceId: workspace.id,
      screen: "Page",
      params: {
        pageId: document.id,
      },
    });
    if (props.onWorkspaceStructureCreated) {
      props.onWorkspaceStructureCreated();
    }
  };

  return (
    <>
      <FormWrapper>
        <ModalHeader>Create a workspace</ModalHeader>
        <Input
          ref={inputRef}
          label={"Workspace name"}
          onChangeText={setName}
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
      <VerifyPasswordModal
        isVisible={isPasswordModalVisible}
        description="Creating a new workspace requires access to the main account and therefore verifying your password is required"
        onSuccess={() => {
          setIsPasswordModalVisible(false);
          setTimeout(() => {
            console.log(inputRef.current);
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }, 250);
        }}
        onCancel={() => {
          setIsPasswordModalVisible(false);
          if (props.onBackdropPress) {
            props.onBackdropPress();
          }
        }}
      />
    </>
  );
}
