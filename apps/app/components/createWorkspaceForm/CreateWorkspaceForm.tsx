import { useNavigation } from "@react-navigation/native";
import * as documentChain from "@serenity-kit/document-chain";
import * as workspaceChain from "@serenity-kit/workspace-chain";
import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
import {
  VerifiedDevice,
  createIntroductionDocumentSnapshot,
  createSnapshotKey,
  encryptDocumentTitle,
  encryptFolderName,
  encryptWorkspaceInfo,
  folderDerivedKeyContext,
  generateId,
  snapshotDerivedKeyContext,
} from "@serenity-tools/common";
import { createSubkeyId } from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";
import {
  Button,
  FormWrapper,
  InfoMessage,
  Input,
  ModalButtonFooter,
  ModalHeader,
} from "@serenity-tools/ui";
import { useEffect, useRef, useState } from "react";
import { TextInput } from "react-native";
import sodium from "react-native-libsodium";
import { useAppContext } from "../../context/AppContext";
import { useCreateInitialWorkspaceStructureMutation } from "../../generated/graphql";
import { getMainDevice } from "../../store/mainDeviceMemoryStore";
import { loadRemoteCurrentUser } from "../../store/userChainStore";
import * as workspaceStore from "../../store/workspaceStore";
import { createWorkspaceKeyBoxesForDevices } from "../../utils/device/createWorkspaceKeyBoxesForDevices";
import { VerifyPasswordModal } from "../verifyPasswordModal/VerifyPasswordModal";

export type CreateWorkspaceFormProps = {
  onCancel?: () => void;
  onWorkspaceStructureCreated?: () => void;
};

export function CreateWorkspaceForm(props: CreateWorkspaceFormProps) {
  const inputRef = useRef<TextInput>();
  const [name, setName] = useState<string>("");
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [hasCreateWorkspaceError, setHasCreateWorkspaceError] = useState(false);
  const { activeDevice } = useAppContext();
  const navigation = useNavigation();
  const [, createInitialWorkspaceStructure] =
    useCreateInitialWorkspaceStructureMutation();

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
    setIsCreatingWorkspace(true);
    try {
      if (!activeDevice) {
        throw new Error("No active device available");
      }
      const mainDevice = getMainDevice();
      if (!mainDevice) {
        throw new Error("No active main device available");
      }

      const event = workspaceChain.createChain({
        privateKey: mainDevice.signingPrivateKey,
        publicKey: mainDevice.signingPublicKey,
      });
      const workspaceChainState = await workspaceChain.resolveState([event]);
      const workspaceKeyId = generateId();
      const folderId = generateId();
      const folderName = "Getting started";
      const documentName = "Introduction";

      const { state: userChainState } = await loadRemoteCurrentUser();
      const nonExpiredDevices: VerifiedDevice[] = [];
      Object.entries(userChainState.devices).forEach(
        ([signingPublicKey, { expiresAt, encryptionPublicKey }]) => {
          if (signingPublicKey === userChainState.mainDeviceSigningPublicKey) {
            nonExpiredDevices.unshift({
              signingPublicKey,
              encryptionPublicKey,
              expiresAt: expiresAt ? new Date(expiresAt) : undefined,
            });
          } else {
            if (
              expiresAt === undefined ||
              (expiresAt && new Date(expiresAt) > new Date())
            ) {
              nonExpiredDevices.push({
                signingPublicKey,
                encryptionPublicKey,
                expiresAt: expiresAt ? new Date(expiresAt) : undefined,
              });
            }
          }
        }
      );

      // build workspace key boxes for workspace
      const { deviceWorkspaceKeyBoxes, workspaceKey } =
        createWorkspaceKeyBoxesForDevices({
          devices: nonExpiredDevices,
          activeDevice,
          workspaceId: event.transaction.id,
          workspaceKeyId,
        });
      if (!workspaceKey) {
        throw new Error("Could not retrieve workspaceKey!");
      }

      const workspaceMemberDevicesProof =
        workspaceMemberDevicesProofUtil.createWorkspaceMemberDevicesProof({
          authorKeyPair: {
            privateKey: sodium.from_base64(mainDevice.signingPrivateKey),
            publicKey: sodium.from_base64(mainDevice.signingPublicKey),
            keyType: "ed25519",
          },
          workspaceMemberDevicesProofData: {
            clock: 0,
            userChainHashes: { [userChainState.id]: userChainState.eventHash },
            workspaceChainHash: workspaceChainState.lastEventHash,
          },
        });

      const folderSubkeyId = createSubkeyId();
      const folderKeyDerivationTrace = {
        workspaceKeyId,
        trace: [
          {
            entryId: folderId,
            subkeyId: folderSubkeyId,
            parentId: null,
            context: folderDerivedKeyContext,
          },
        ],
      };
      const encryptedFolderResult = encryptFolderName({
        name: folderName,
        parentKey: workspaceKey,
        folderId,
        workspaceId: event.transaction.id,
        keyDerivationTrace: folderKeyDerivationTrace,
        subkeyId: folderSubkeyId,
        workspaceMemberDevicesProof,
        device: activeDevice,
      });

      // prepare document snapshot
      const snapshotKey = createSnapshotKey({
        folderKey: encryptedFolderResult.folderSubkey,
      });

      const createDocumentChainEvent = documentChain.createDocumentChain({
        authorKeyPair: {
          privateKey: activeDevice.signingPrivateKey,
          publicKey: activeDevice.signingPublicKey,
        },
      });
      const documentChainState = documentChain.resolveState({
        events: [createDocumentChainEvent],
        knownVersion: documentChain.version,
      });

      const snapshotId = generateId();
      const snapshot = createIntroductionDocumentSnapshot({
        documentId: createDocumentChainEvent.transaction.id,
        snapshotEncryptionKey: sodium.from_base64(snapshotKey.key),
        documentChainEventHash: documentChainState.currentState.eventHash,
        workspaceMemberDevicesProof,
        keyDerivationTrace: {
          workspaceKeyId,
          trace: [
            {
              entryId: folderId,
              subkeyId: encryptedFolderResult.folderSubkeyId,
              parentId: null,
              context: folderDerivedKeyContext,
            },
            {
              entryId: snapshotId,
              parentId: folderId,
              subkeyId: snapshotKey.subkeyId,
              context: snapshotDerivedKeyContext,
            },
          ],
        },
        device: mainDevice,
      });

      const workspaceKeyBox = deviceWorkspaceKeyBoxes.find((device) => {
        return device.deviceSigningPublicKey === activeDevice.signingPublicKey;
      });

      // prepare document
      const encryptedDocumentTitle = encryptDocumentTitle({
        title: documentName,
        activeDevice,
        snapshot: {
          keyDerivationTrace: snapshot.publicData.keyDerivationTrace,
        },
        workspaceKeyBox: {
          ...workspaceKeyBox!,
          creatorDevice: activeDevice,
        },
        workspaceId: event.transaction.id,
        workspaceKeyId,
        workspaceMemberDevicesProof,
        documentId: createDocumentChainEvent.transaction.id,
      });

      const encryptedWorkspaceInfo = encryptWorkspaceInfo({
        name,
        key: workspaceKey,
        device: activeDevice,
        workspaceId: event.transaction.id,
        workspaceKeyId,
        workspaceMemberDevicesProof,
      });

      const createInitialWorkspaceStructureResult =
        await createInitialWorkspaceStructure({
          input: {
            workspace: {
              infoCiphertext: encryptedWorkspaceInfo.ciphertext,
              infoNonce: encryptedWorkspaceInfo.nonce,
              infoSignature: encryptedWorkspaceInfo.signature,
              workspaceKeyId,
              deviceWorkspaceKeyBoxes,
            },
            serializedWorkspaceMemberDevicesProof: JSON.stringify(
              workspaceMemberDevicesProof
            ),
            serializedWorkspaceChainEvent: JSON.stringify(event),
            folder: {
              id: folderId,
              signature: encryptedFolderResult.signature,
              nameCiphertext: encryptedFolderResult.ciphertext,
              nameNonce: encryptedFolderResult.nonce,
              keyDerivationTrace: folderKeyDerivationTrace,
            },
            document: {
              nameCiphertext: encryptedDocumentTitle.ciphertext,
              nameNonce: encryptedDocumentTitle.nonce,
              nameSignature: encryptedDocumentTitle.signature,
              subkeyId: encryptedDocumentTitle.subkeyId,
              snapshot,
              serializedDocumentChainEvent: JSON.stringify(
                createDocumentChainEvent
              ),
            },
            creatorDeviceSigningPublicKey: activeDevice?.signingPublicKey!,
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
        throw new Error("Could not create workspace structure!");
      }

      const workspace =
        createInitialWorkspaceStructureResult.data
          .createInitialWorkspaceStructure.workspace;
      const document =
        createInitialWorkspaceStructureResult.data
          .createInitialWorkspaceStructure.document;

      workspaceStore.createWorkspace({ id: workspace.id, name });

      navigation.navigate("Workspace", {
        workspaceId: workspace.id,
        screen: "WorkspaceDrawer",
        params: {
          screen: "Page",
          params: {
            pageId: document.id,
          },
        },
      });
      if (props.onWorkspaceStructureCreated) {
        props.onWorkspaceStructureCreated();
      }
    } catch (err) {
      console.error(err);
      setHasCreateWorkspaceError(true);
    } finally {
      setIsCreatingWorkspace(false);
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
        {hasCreateWorkspaceError && (
          <InfoMessage variant="error">
            Failed to create the workspace. Please try again later.
          </InfoMessage>
        )}
        <ModalButtonFooter
          confirm={
            <Button
              disabled={name.trim() === ""}
              onPress={createWorkspace}
              isLoading={isCreatingWorkspace}
            >
              Create workspace
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
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }, 250);
        }}
        onCancel={() => {
          setIsPasswordModalVisible(false);
          if (props.onCancel) {
            props.onCancel();
          }
        }}
      />
    </>
  );
}
