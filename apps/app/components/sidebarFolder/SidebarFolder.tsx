import { useFocusRing } from "@react-native-aria/focus";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as documentChain from "@serenity-kit/document-chain";
import {
  KeyDerivationTrace,
  SerenitySnapshotPublicData,
  createSnapshotKey,
  decryptFolderName,
  deriveKeysFromKeyDerivationTrace,
  encryptDocumentTitle,
  encryptFolderName,
  folderDerivedKeyContext,
  generateId,
  snapshotDerivedKeyContext,
} from "@serenity-tools/common";
import { createSubkeyId } from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";
import {
  SnapshotPublicData,
  createInitialSnapshot,
} from "@serenity-tools/secsync";
import {
  Icon,
  IconButton,
  InlineInput,
  Pressable,
  SidebarText,
  Tooltip,
  View,
  ViewProps,
  tw,
  useIsDesktopDevice,
} from "@serenity-tools/ui";
import { HStack } from "native-base";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import sodium, { KeyPair } from "react-native-libsodium";
import {
  runCreateDocumentMutation,
  runCreateFolderMutation,
  runDeleteFoldersMutation,
  runUpdateFolderNameMutation,
  useDocumentsQuery,
  useFoldersQuery,
} from "../../generated/graphql";
import { useAuthenticatedAppContext } from "../../hooks/useAuthenticatedAppContext";
import { getCurrentUserInfo } from "../../store/currentUserInfoStore";
import { useCanEditDocumentsAndFolders } from "../../store/workspaceChainStore";
import {
  getLocalOrLoadRemoteWorkspaceMemberDevicesProofQueryByHash,
  loadRemoteWorkspaceMemberDevicesProofQuery,
} from "../../store/workspaceMemberDevicesProofStore";
import { RootStackScreenProps } from "../../types/navigationProps";
import { useActiveDocumentStore } from "../../utils/document/activeDocumentStore";
import {
  getDocumentPath,
  useDocumentPathStore,
} from "../../utils/document/documentPathStore";
import { createFolderKeyDerivationTrace } from "../../utils/folder/createFolderKeyDerivationTrace";
import { useFolderKeyStore } from "../../utils/folder/folderKeyStore";
import { useOpenFolderStore } from "../../utils/folder/openFolderStore";
import { isValidDeviceSigningPublicKey } from "../../utils/isValidDeviceSigningPublicKey/isValidDeviceSigningPublicKey";
import { OS } from "../../utils/platform/platform";
import { getWorkspace } from "../../utils/workspace/getWorkspace";
import { retrieveWorkspaceKey } from "../../utils/workspace/retrieveWorkspaceKey";
import SidebarFolderMenu from "../sidebarFolderMenu/SidebarFolderMenu";
import SidebarPage from "../sidebarPage/SidebarPage";

type Props = ViewProps & {
  workspaceId: string;
  folderId: string;
  parentFolderId?: string | null | undefined;
  folderName?: string;
  nameCiphertext: string;
  nameNonce: string;
  signature: string;
  workspaceMemberDevicesProofHash: string;
  creatorDeviceSigningPublicKey: string;
  subkeyId: string;
  keyDerivationTrace: KeyDerivationTrace;
  depth?: number;
  onStructureChange: () => void;
};

export default function SidebarFolder(props: Props) {
  const defaultFolderName = "Untitled";
  const route = useRoute<RootStackScreenProps<"Workspace">["route"]>();
  const navigation = useNavigation();
  const openFolderIds = useOpenFolderStore((state) => state.folderIds);
  const folderStore = useOpenFolderStore();
  const isDesktopDevice = useIsDesktopDevice();
  const [isHovered, setIsHovered] = useState(false);
  const { isFocusVisible, focusProps: focusRingProps }: any = useFocusRing();
  const [isDeleted, setIsDeleted] = useState(false);
  const isOpen = openFolderIds.includes(props.folderId);
  const [isEditing, setIsEditing] = useState<"none" | "name" | "new">("none");
  const [foldersResult, refetchFolders] = useFoldersQuery({
    pause: !isOpen,
    variables: {
      parentFolderId: props.folderId,
      first: 50,
    },
  });
  const [documentsResult, refetchDocuments] = useDocumentsQuery({
    pause: !isOpen,
    variables: {
      parentFolderId: props.folderId,
      first: 50,
    },
  });
  const { depth = 0 } = props;
  const { activeDevice } = useAuthenticatedAppContext();
  const documentPathStore = useDocumentPathStore();
  const activeDocumentId = useActiveDocumentStore(
    (state) => state.activeDocumentId
  );
  const documentPathIds = useDocumentPathStore((state) => state.folderIds);
  const [folderName, setFolderName] = useState("loading…");
  const getFolderKey = useFolderKeyStore((state) => state.getFolderKey);

  useEffect(() => {
    const isOpen = openFolderIds.indexOf(props.folderId) >= 0;
    if (isOpen) {
      refetchFolders();
      refetchDocuments();
    }
  }, [openFolderIds, props.folderId]);

  useEffect(() => {
    decryptName();
  }, [
    props.nameCiphertext,
    props.keyDerivationTrace.trace[props.keyDerivationTrace.trace.length - 1]
      .subkeyId,
  ]);

  const currentUserInfo = getCurrentUserInfo();
  if (!currentUserInfo) throw new Error("No current user");
  const canEditAndDocumentsFolders = useCanEditDocumentsAndFolders({
    workspaceId: props.workspaceId,
    mainDeviceSigningPublicKey: currentUserInfo.mainDeviceSigningPublicKey,
  });

  const decryptName = async () => {
    const folderSubkeyId =
      props.keyDerivationTrace.trace[props.keyDerivationTrace.trace.length - 1]
        .subkeyId;
    const workspace = await getWorkspace({
      deviceSigningPublicKey: activeDevice.signingPublicKey,
      workspaceId: props.workspaceId,
    });
    if (!workspace?.workspaceKeys) {
      // TODO: handle error in UI
      console.error("Workspace or workspaceKeys not found");
      return;
    }
    let folderWorkspaceKey: any = undefined;
    for (const workspaceKey of workspace.workspaceKeys!) {
      if (workspaceKey.id === props.keyDerivationTrace.workspaceKeyId) {
        folderWorkspaceKey = workspaceKey;
      }
    }
    if (!folderWorkspaceKey?.workspaceKeyBox) {
      console.error("Folder workspace key not found");
    }
    const workspaceKeyData = await retrieveWorkspaceKey({
      workspaceId: workspace.id,
      workspaceKeyId: props.keyDerivationTrace.workspaceKeyId,
      activeDevice,
    });
    const workspaceKey = workspaceKeyData.workspaceKey;
    try {
      const parentKeyChainData = deriveKeysFromKeyDerivationTrace({
        keyDerivationTrace: props.keyDerivationTrace,
        workspaceKeyBox: folderWorkspaceKey.workspaceKeyBox!,
        activeDevice: {
          signingPublicKey: activeDevice.signingPublicKey,
          signingPrivateKey: activeDevice.signingPrivateKey!,
          encryptionPublicKey: activeDevice.encryptionPublicKey,
          encryptionPrivateKey: activeDevice.encryptionPrivateKey!,
          encryptionPublicKeySignature:
            activeDevice.encryptionPublicKeySignature!,
        },
        workspaceId: workspace.id,
        workspaceKeyId: props.keyDerivationTrace.workspaceKeyId,
      });
      // since the decryptFolderName method takes a parent key
      // and the last item of the key chain is the current folder key,
      // we have to send in the parent key to the decryptFolderName method
      let parentKey = workspaceKey;
      if (parentKeyChainData.trace.length > 1) {
        parentKey =
          parentKeyChainData.trace[parentKeyChainData.trace.length - 2].key;
      }

      const workspaceMemberDevicesProof =
        await getLocalOrLoadRemoteWorkspaceMemberDevicesProofQueryByHash({
          workspaceId: props.workspaceId,
          hash: props.workspaceMemberDevicesProofHash,
        });
      if (!workspaceMemberDevicesProof) {
        throw new Error("workspaceMemberDevicesProof not found");
      }

      const isValid = isValidDeviceSigningPublicKey({
        signingPublicKey: props.creatorDeviceSigningPublicKey,
        workspaceMemberDevicesProofEntry: workspaceMemberDevicesProof,
        workspaceId: props.workspaceId,
        minimumRole: "EDITOR",
      });
      if (!isValid) {
        throw new Error(
          "Invalid signing public key for the workspaceMemberDevicesProof"
        );
      }

      const folderName = decryptFolderName({
        parentKey,
        subkeyId: folderSubkeyId,
        ciphertext: props.nameCiphertext,
        nonce: props.nameNonce,
        workspaceMemberDevicesProof: workspaceMemberDevicesProof.proof,
        folderId: props.folderId,
        workspaceId: props.workspaceId,
        signature: props.signature,
        keyDerivationTrace: props.keyDerivationTrace,
        creatorDeviceSigningPublicKey: props.creatorDeviceSigningPublicKey,
      });
      setFolderName(folderName);
    } catch (error) {
      console.error(error);
      setFolderName("decryption error");
    }
  };

  const createFolder = async (name: string) => {
    openFolder();
    const id = generateId();
    // let workspaceKey = "";
    const workspace = await getWorkspace({
      deviceSigningPublicKey: activeDevice.signingPublicKey,
      workspaceId: props.workspaceId,
    });
    if (!workspace?.currentWorkspaceKey) {
      // TODO: handle error in UI
      console.error("Workspace or workspaceKeys not found");
      return;
    }
    const parentFolderKeyChainData = deriveKeysFromKeyDerivationTrace({
      keyDerivationTrace: props.keyDerivationTrace,
      activeDevice: {
        signingPublicKey: activeDevice.signingPublicKey,
        signingPrivateKey: activeDevice.signingPrivateKey!,
        encryptionPublicKey: activeDevice.encryptionPublicKey,
        encryptionPrivateKey: activeDevice.encryptionPrivateKey!,
        encryptionPublicKeySignature:
          activeDevice.encryptionPublicKeySignature!,
      },
      workspaceKeyBox: workspace.currentWorkspaceKey.workspaceKeyBox!,
      workspaceId: workspace.id,
      workspaceKeyId: workspace.currentWorkspaceKey.id,
    });
    const parentChainItem =
      parentFolderKeyChainData.trace[parentFolderKeyChainData.trace.length - 1];

    const folderSubkeyId = createSubkeyId();
    const keyDerivationTrace = await createFolderKeyDerivationTrace({
      workspaceKeyId: workspace?.currentWorkspaceKey?.id!,
      folderId: props.folderId,
    });
    keyDerivationTrace.trace.push({
      entryId: id,
      subkeyId: folderSubkeyId,
      parentId: props.folderId,
      context: folderDerivedKeyContext,
    });

    const workspaceMemberDevicesProof =
      await loadRemoteWorkspaceMemberDevicesProofQuery({
        workspaceId: workspace.id,
      });

    const encryptedFolderResult = encryptFolderName({
      name,
      parentKey: parentChainItem.key,
      folderId: id,
      keyDerivationTrace,
      subkeyId: folderSubkeyId,
      workspaceId: props.workspaceId,
      workspaceMemberDevicesProof: workspaceMemberDevicesProof.proof,
      device: activeDevice,
    });

    let didCreateFolderSucceed = false;
    let numCreateFolderAttempts = 0;
    let folderId: string | undefined = undefined;
    let result: any = undefined;
    do {
      numCreateFolderAttempts += 1;
      result = await runCreateFolderMutation(
        {
          input: {
            id,
            workspaceId: props.workspaceId,
            nameCiphertext: encryptedFolderResult.ciphertext,
            nameNonce: encryptedFolderResult.nonce,
            signature: encryptedFolderResult.signature,
            workspaceMemberDevicesProofHash:
              workspaceMemberDevicesProof.proof.hash,
            workspaceKeyId: workspace?.currentWorkspaceKey?.id!,
            subkeyId: encryptedFolderResult.folderSubkeyId,
            parentFolderId: props.folderId,
            keyDerivationTrace,
          },
        },
        {}
      );
      if (result.data?.createFolder?.folder?.id) {
        didCreateFolderSucceed = true;
        folderId = result.data?.createFolder?.folder?.id;
        setIsEditing("none");
      }
    } while (!didCreateFolderSucceed && numCreateFolderAttempts < 5);
    if (folderId) {
    } else {
      console.error(result.error);
      alert("Failed to create a folder. Please try again.");
    }
    refetchDocuments();
    refetchFolders();
  };

  const createDocument = async () => {
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
    const documentId = createDocumentChainEvent.transaction.id;
    const snapshotId = generateId();
    const documentName = "Untitled";
    const workspace = await getWorkspace({
      deviceSigningPublicKey: activeDevice.signingPublicKey,
      workspaceId: props.workspaceId,
    });
    if (!workspace?.currentWorkspaceKey) {
      console.error("Workspace or workspaceKeys not found");
      return;
    }
    const folderKeyTrace = deriveKeysFromKeyDerivationTrace({
      keyDerivationTrace: props.keyDerivationTrace,
      workspaceKeyBox: workspace.currentWorkspaceKey.workspaceKeyBox!,
      activeDevice: {
        signingPublicKey: activeDevice.signingPublicKey,
        signingPrivateKey: activeDevice.signingPrivateKey!,
        encryptionPublicKey: activeDevice.encryptionPublicKey,
        encryptionPrivateKey: activeDevice.encryptionPrivateKey!,
        encryptionPublicKeySignature:
          activeDevice.encryptionPublicKeySignature!,
      },
      workspaceId: workspace.id,
      workspaceKeyId: workspace.currentWorkspaceKey.id,
    });
    const folderKey = folderKeyTrace.trace[folderKeyTrace.trace.length - 1].key;
    const snapshotKey = createSnapshotKey({ folderKey });
    const snapshotKeyDerivationTrace = await createFolderKeyDerivationTrace({
      folderId: props.folderId,
      workspaceKeyId: workspace.currentWorkspaceKey.id,
    });
    snapshotKeyDerivationTrace.trace.push({
      entryId: snapshotId,
      parentId: props.folderId,
      subkeyId: snapshotKey.subkeyId,
      context: snapshotDerivedKeyContext,
    });
    const signatureKeyPair: KeyPair = {
      publicKey: sodium.from_base64(activeDevice.signingPublicKey),
      privateKey: sodium.from_base64(activeDevice.signingPrivateKey!),
      keyType: "ed25519",
    };

    const workspaceMemberDevicesProof =
      await loadRemoteWorkspaceMemberDevicesProofQuery({
        workspaceId: props.workspaceId,
      });

    const publicData: SnapshotPublicData & SerenitySnapshotPublicData = {
      snapshotId: snapshotId,
      docId: documentId,
      pubKey: sodium.to_base64(signatureKeyPair.publicKey),
      keyDerivationTrace: snapshotKeyDerivationTrace,
      documentChainEventHash: documentChainState.currentState.eventHash,
      parentSnapshotId: "",
      parentSnapshotUpdateClocks: {},
      workspaceMemberDevicesProof: workspaceMemberDevicesProof.proof,
    };
    // created using:
    // const yDocState = Yjs.encodeStateAsUpdateV2(yDocRef.current);
    // console.log(sodium.to_base64(yDocState));
    //
    // to do so create an initial document without any yDoc ref and set the first
    // line to have a H1 header
    const initialDocument = `AAEABsal8N4eAAEAAAMHACgUEHBhZ2VoZWFkaW5nbGV2ZWwEBwUDAQAAAQMBAQECAH0BAA`;
    const snapshot = createInitialSnapshot<SerenitySnapshotPublicData>(
      sodium.from_base64(initialDocument),
      publicData,
      sodium.from_base64(snapshotKey.key),
      signatureKeyPair,
      sodium
    );

    const documentNameData = encryptDocumentTitle({
      title: documentName,
      activeDevice,
      snapshot: {
        keyDerivationTrace: snapshot.publicData.keyDerivationTrace,
      },
      workspaceKeyBox: workspace.currentWorkspaceKey.workspaceKeyBox!,
      workspaceId: workspace.id,
      workspaceKeyId: workspace.currentWorkspaceKey.id,
      documentId,
      workspaceMemberDevicesProof: workspaceMemberDevicesProof.proof,
    });
    const result = await runCreateDocumentMutation(
      {
        input: {
          nameCiphertext: documentNameData.ciphertext,
          nameNonce: documentNameData.nonce,
          nameSignature: documentNameData.signature,
          nameWorkspaceMemberDevicesProofHash:
            workspaceMemberDevicesProof.proof.hash,
          subkeyId: documentNameData.subkeyId,
          workspaceId: props.workspaceId,
          parentFolderId: props.folderId,
          snapshot,
          serializedDocumentChainEvent: JSON.stringify(
            createDocumentChainEvent
          ),
        },
      },
      {}
    );
    if (result.data?.createDocument?.id) {
      navigation.navigate("Workspace", {
        workspaceId: props.workspaceId,
        screen: "WorkspaceDrawer",
        params: {
          screen: "Page",
          params: {
            pageId: result.data?.createDocument?.id,
            isNew: true,
          },
        },
      });
    } else {
      console.error(result.error);
      alert("Failed to create a page. Please try again.");
    }
    refetchDocuments();
    refetchFolders();
  };

  const editFolderName = () => {
    setIsEditing("name");
  };

  const toggleFolderOpen = () => {
    if (isOpen) {
      closeFolder();
    } else {
      openFolder();
    }
  };

  const openFolder = () => {
    const openFolderIds = folderStore.folderIds;
    if (!openFolderIds.includes(props.folderId)) {
      openFolderIds.push(props.folderId);
      folderStore.update(openFolderIds);
    }
  };

  const closeFolder = () => {
    const openFolderIds = folderStore.folderIds;
    const position = openFolderIds.indexOf(props.folderId);
    if (position >= 0) {
      openFolderIds.splice(position, 1);
      folderStore.update(openFolderIds);
    }
  };
  const updateFolderName = async (newFolderName: string) => {
    let workspace = await getWorkspace({
      workspaceId: props.workspaceId,
      deviceSigningPublicKey: activeDevice.signingPublicKey,
    });
    if (!workspace) {
      throw new Error("Workspace not found");
    }
    if (!workspace.currentWorkspaceKey!.workspaceKeyBox) {
      throw new Error("no workspace key boxes for this workspace");
    }
    const workspaceKeyData = await retrieveWorkspaceKey({
      workspaceId: workspace.id,
      workspaceKeyId: workspace.currentWorkspaceKey!.id,
      activeDevice,
    });
    const folderSubkeyId = createSubkeyId();
    const workspaceKey = workspaceKeyData.workspaceKey;
    const folderKeyTrace = deriveKeysFromKeyDerivationTrace({
      keyDerivationTrace: props.keyDerivationTrace,
      activeDevice: {
        signingPublicKey: activeDevice.signingPublicKey,
        signingPrivateKey: activeDevice.signingPrivateKey!,
        encryptionPublicKey: activeDevice.encryptionPublicKey,
        encryptionPrivateKey: activeDevice.encryptionPrivateKey!,
        encryptionPublicKeySignature:
          activeDevice.encryptionPublicKeySignature!,
      },
      workspaceKeyBox: workspace.currentWorkspaceKey!.workspaceKeyBox!,
      workspaceId: workspace.id,
      workspaceKeyId: workspace.currentWorkspaceKey!.id,
    });
    // ignore the last chain item as it's the key for the old folder name
    let parentKey = workspaceKey;
    if (folderKeyTrace.trace.length > 1) {
      parentKey = folderKeyTrace.trace[folderKeyTrace.trace.length - 2].key;
    }
    const keyDerivationTrace = await createFolderKeyDerivationTrace({
      folderId: props.folderId,
      workspaceKeyId: workspace?.currentWorkspaceKey?.id!,
    });
    // update the new subkey for this folder name encryption
    keyDerivationTrace.trace[keyDerivationTrace.trace.length - 1].subkeyId =
      folderSubkeyId;

    const workspaceMemberDevicesProof =
      await loadRemoteWorkspaceMemberDevicesProofQuery({
        workspaceId: workspace.id,
      });

    const encryptedFolderResult = encryptFolderName({
      name: newFolderName,
      parentKey,
      subkeyId: folderSubkeyId,
      workspaceId: props.workspaceId,
      keyDerivationTrace,
      folderId: props.folderId,
      workspaceMemberDevicesProof: workspaceMemberDevicesProof.proof,
      device: activeDevice,
    });

    const updateFolderNameResult = await runUpdateFolderNameMutation(
      {
        input: {
          id: props.folderId,
          nameCiphertext: encryptedFolderResult.ciphertext,
          nameNonce: encryptedFolderResult.nonce,
          signature: encryptedFolderResult.signature,
          workspaceMemberDevicesProofHash:
            workspaceMemberDevicesProof.proof.hash,
          workspaceKeyId: workspace?.currentWorkspaceKey?.id!,
          subkeyId: encryptedFolderResult.folderSubkeyId!,
          keyDerivationTrace,
        },
      },
      {}
    );
    const updatedFolder = updateFolderNameResult.data?.updateFolderName?.folder;
    if (updatedFolder) {
      setFolderName(newFolderName);
      // refetch the document path
      // TODO: Optimize by checking if the current folder is in the document path
      if (activeDocumentId && documentPathIds.includes(props.folderId)) {
        const documentPath = await getDocumentPath(activeDocumentId);
        documentPathStore.update(documentPath, activeDevice, getFolderKey);
      }
    } else {
      // TODO: show error: couldn't update folder name
    }
    setIsEditing("none");
  };

  const deleteFolder = async (folderId: string) => {
    const deleteFoldersResult = await runDeleteFoldersMutation(
      {
        input: {
          ids: [folderId],
          workspaceId: props.workspaceId,
        },
      },
      {}
    );
    if (deleteFoldersResult.data && deleteFoldersResult.data.deleteFolders) {
      setIsDeleted(true);
      props.onStructureChange();
    } else {
      // TODO: show error: couldn't delete folder
    }
  };

  const styles = StyleSheet.create({
    folder: tw``,
    hover: tw`bg-gray-200`,
    focusVisible:
      OS === "web" || OS === "electron" ? tw`se-inset-focus-mini` : {},
  });

  const maxWidthBase = isDesktopDevice ? 32 : 42;
  const maxWidth = maxWidthBase - depth * 2;

  if (isDeleted) {
    return <></>;
  }

  return (
    <>
      <View
        style={[
          styles.folder,
          isHovered && styles.hover,
          isFocusVisible && styles.focusVisible,
          props.style,
        ]}
        // as Views usually shouldn't have mouse-events ()
        // @ts-expect-error as views usually don't have hover
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <HStack>
          <Pressable
            {...focusRingProps} // needed so focus is shown on view-wrapper
            onPress={toggleFolderOpen}
            style={[
              tw`grow-1 pl-${depth * (isDesktopDevice ? 3 : 4)}`, // needed so clickable area is as large as possible
            ]}
            // disable default outline styles and add 1 overridden style manually (grow)
            _focusVisible={{
              _web: { style: { outlineStyle: "none", flexGrow: 1 } },
            }}
          >
            <View style={[tw`pl-5 md:pl-2.5`]}>
              <HStack
                alignItems="center"
                style={[
                  tw`py-2 md:py-1.5`,
                  !isDesktopDevice && tw`border-b border-gray-200`,
                ]}
              >
                <View style={!isDesktopDevice && tw`-ml-1`}>
                  {documentPathIds.includes(props.folderId) ? (
                    <Icon
                      name={isOpen ? "arrow-down-filled" : "arrow-right-filled"}
                      color={"gray-800"}
                      mobileSize={5}
                    />
                  ) : (
                    <Icon
                      name={isOpen ? "arrow-down-filled" : "arrow-right-filled"}
                      color={isDesktopDevice ? "gray-500" : "gray-400"}
                      mobileSize={5}
                    />
                  )}
                </View>
                <View style={tw`-ml-0.5`}>
                  <Icon name="folder" size={5} mobileSize={8} />
                </View>

                {isEditing === "name" ? (
                  <InlineInput
                    onSubmit={updateFolderName}
                    onCancel={() => {
                      setIsEditing("none");
                    }}
                    value={folderName}
                    style={tw`ml-0.5 w-${maxWidth}`}
                    testID={`sidebar-folder--${props.folderId}__edit-name`}
                  />
                ) : (
                  <SidebarText
                    style={tw`pl-2 md:pl-1.5 max-w-${maxWidth}`}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    testID={`sidebar-folder--${props.folderId}`}
                  >
                    {folderName}
                  </SidebarText>
                )}
              </HStack>
            </View>
          </Pressable>

          {/* TODO mobile : use overlay element */}
          {isEditing === "new" && (
            <InlineInput
              value=""
              onSubmit={createFolder}
              onCancel={() => {
                setIsEditing("none");
              }}
              style={tw`w-${maxWidth} ml-1.5`}
            />
          )}

          {canEditAndDocumentsFolders && (
            <HStack
              alignItems="center"
              space={1}
              style={[
                tw`pr-4 md:pr-2  ${
                  isHovered || !isDesktopDevice ? "" : "hidden"
                }`,
                !isDesktopDevice && tw`border-b border-gray-200`,
              ]}
            >
              <SidebarFolderMenu
                folderId={props.folderId}
                refetchFolders={refetchFolders}
                onUpdateNamePress={editFolderName}
                onDeletePressed={() => deleteFolder(props.folderId)}
                onCreateFolderPress={() => {
                  createFolder(defaultFolderName);
                }}
              />
              {/* offset not working yet as NB has a no-no in their component */}
              <Tooltip label="New page" placement="right" offset={8}>
                <IconButton
                  onPress={createDocument}
                  name="file-add-line"
                  color="gray-600"
                  style={tw`p-2 md:p-0`}
                  testID={`sidebar-folder--${props.folderId}__create-document`}
                ></IconButton>
              </Tooltip>
              {documentsResult.fetching ||
                (foldersResult.fetching && <ActivityIndicator />)}
            </HStack>
          )}
        </HStack>
      </View>

      {isOpen && (
        <>
          {foldersResult.data?.folders?.nodes
            ? foldersResult.data?.folders?.nodes.map((folder) => {
                if (folder === null) {
                  return null;
                }
                return (
                  <SidebarFolder
                    key={folder.id}
                    folderId={folder.id}
                    parentFolderId={folder.parentFolderId}
                    workspaceId={props.workspaceId}
                    subkeyId={
                      folder.keyDerivationTrace.trace[
                        folder.keyDerivationTrace.trace.length - 1
                      ].subkeyId
                    }
                    nameCiphertext={folder.nameCiphertext}
                    nameNonce={folder.nameNonce}
                    signature={folder.signature}
                    workspaceMemberDevicesProofHash={
                      folder.workspaceMemberDevicesProofHash
                    }
                    keyDerivationTrace={folder.keyDerivationTrace}
                    creatorDeviceSigningPublicKey={
                      folder.creatorDeviceSigningPublicKey
                    }
                    onStructureChange={props.onStructureChange}
                    depth={depth + 1}
                  />
                );
              })
            : null}
          {documentsResult.data?.documents?.nodes
            ? documentsResult.data?.documents?.nodes.map((document) => {
                if (document === null) {
                  return null;
                }
                return (
                  <SidebarPage
                    key={document.id}
                    parentFolderId={props.folderId}
                    documentId={document.id}
                    workspaceId={props.workspaceId}
                    onRefetchDocumentsPress={refetchDocuments}
                    depth={depth}
                  />
                );
              })
            : null}
        </>
      )}
    </>
  );
}
