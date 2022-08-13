import { useFocusRing } from "@react-native-aria/focus";
import { useNavigation, useRoute } from "@react-navigation/native";
import { encryptFolder } from "@serenity-tools/common";
import {
  Icon,
  IconButton,
  InlineInput,
  Pressable,
  Text,
  Tooltip,
  tw,
  useIsDesktopDevice,
  View,
  ViewProps,
} from "@serenity-tools/ui";
import { HStack } from "native-base";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet } from "react-native";
import { useClient } from "urql";
import { v4 as uuidv4 } from "uuid";
import {
  useCreateDocumentMutation,
  useCreateFolderMutation,
  useDeleteFoldersMutation,
  useDevicesQuery,
  useDocumentsQuery,
  useFoldersQuery,
  useUpdateFolderNameMutation,
} from "../../generated/graphql";
import { Device } from "../../types/Device";
import { RootStackScreenProps } from "../../types/navigation";
import { decryptWorkspaceKey } from "../../utils/device/decryptWorkspaceKey";
import { getActiveDevice } from "../../utils/device/getActiveDevice";
import { getDeviceBySigningPublicKey } from "../../utils/device/getDeviceBySigningPublicKey";
import { getMainDevice } from "../../utils/device/mainDeviceMemoryStore";
import {
  getDocumentPath,
  useDocumentPathStore,
} from "../../utils/document/documentPathStore";
import { useDocumentStore } from "../../utils/document/documentStore";
import { useOpenFolderStore } from "../../utils/folder/openFolderStore";
import { getWorkspace } from "../../utils/workspace/getWorkspace";
import SidebarFolderMenu from "../sidebarFolderMenu/SidebarFolderMenu";
import SidebarPage from "../sidebarPage/SidebarPage";

type Props = ViewProps & {
  workspaceId: string;
  folderId: string;
  folderName: string;
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
  const [isOpen, setIsOpen] = useState(openFolderIds.includes(props.folderId));
  const [isHovered, setIsHovered] = useState(false);
  const { isFocusVisible, focusProps: focusRingProps }: any = useFocusRing();

  const [isEditing, setIsEditing] = useState<"none" | "name" | "new">("none");
  const [, createDocumentMutation] = useCreateDocumentMutation();
  const [, createFolderMutation] = useCreateFolderMutation();
  const [, updateFolderNameMutation] = useUpdateFolderNameMutation();
  const [, deleteFoldersMutation] = useDeleteFoldersMutation();
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
  const [devicesResult] = useDevicesQuery({
    variables: {
      first: 500,
    },
  });
  const { depth = 0 } = props;
  const urqlClient = useClient();
  const documentPathStore = useDocumentPathStore();
  const document = useDocumentStore((state) => state.document);
  const documentPathIds = useDocumentPathStore((state) => state.folderIds);

  useEffect(() => {
    setIsOpen(openFolderIds.includes(props.folderId));
  }, [openFolderIds, props.folderId]);

  const createFolder = async (name: string) => {
    setIsOpen(true);
    const id = uuidv4();
    const activeDevice = await getActiveDevice();
    if (!activeDevice) {
      // TODO: handle this error
      console.error("No active device!");
      return;
    }
    const workspace = await getWorkspace({
      urqlClient,
      deviceSigningPublicKey: activeDevice.signingPublicKey,
      workspaceId: props.workspaceId,
    });
    const workspaceKeyBox = workspace?.currentWorkspaceKey?.workspaceKeyBox;
    if (!workspaceKeyBox) {
      // TODO: handle this error
      console.error("This device isn't registered for this workspace!");
      return;
    }
    const mainDevice = getMainDevice();
    const userDevices = devicesResult.data?.devices?.nodes;
    if (!userDevices) {
      // TODO: handle this error
      console.error("No devices found!");
      return;
    }
    const devices: Device[] = [];
    userDevices.forEach((device) => {
      if (device) {
        devices.push(device);
      }
    });
    if (mainDevice) {
      devices.push(mainDevice);
    }
    const encryptingDevice = getDeviceBySigningPublicKey({
      signingPublicKey: workspaceKeyBox.creatorDeviceSigningPublicKey,
      // @ts-ignore: devices array could include nulls
      devices,
    });
    const workspaceKey = await decryptWorkspaceKey({
      ciphertext: workspaceKeyBox?.ciphertext,
      nonce: workspaceKeyBox.nonce,
      creatorDeviceEncryptionPublicKey: encryptingDevice?.encryptionPublicKey!,
      receiverDeviceEncryptionPrivateKey: activeDevice.encryptionPrivateKey!,
    });
    const encryptedFolderResult = await encryptFolder({
      name,
      parentKey: workspaceKey,
    });
    const result = await createFolderMutation({
      input: {
        id,
        name,
        encryptedName: encryptedFolderResult.ciphertext,
        encryptedNameNonce: encryptedFolderResult.publicNonce,
        subKeyId: encryptedFolderResult.folderSubkeyId,
        workspaceId: props.workspaceId,
        parentFolderId: props.folderId,
      },
    });
    if (result.data?.createFolder?.folder?.id) {
      // TODO show notification
      setIsEditing("none");
    } else {
      console.error(result.error);
      alert("Failed to create a folder. Please try again.");
    }
    refetchDocuments();
    refetchFolders();
  };

  const createDocument = async () => {
    openFolder();
    const id = uuidv4();
    const result = await createDocumentMutation({
      input: {
        id,
        workspaceId: props.workspaceId,
        parentFolderId: props.folderId,
      },
    });
    if (result.data?.createDocument?.id) {
      navigation.navigate("Workspace", {
        workspaceId: route.params.workspaceId,
        screen: "Page",
        params: {
          pageId: result.data?.createDocument?.id,
          isNew: true,
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
    setIsOpen(true);
    const openFolderIds = folderStore.folderIds;
    if (!openFolderIds.includes(props.folderId)) {
      openFolderIds.push(props.folderId);
      folderStore.update(openFolderIds);
    }
  };

  const closeFolder = () => {
    setIsOpen(false);
    const openFolderIds = folderStore.folderIds;
    const position = openFolderIds.indexOf(props.folderId);
    if (position >= 0) {
      openFolderIds.splice(position, 1);
      folderStore.update(openFolderIds);
    }
  };
  const updateFolderName = async (newFolderName: string) => {
    const updateFolderNameResult = await updateFolderNameMutation({
      input: {
        id: props.folderId,
        name: newFolderName,
      },
    });
    if (updateFolderNameResult.data?.updateFolderName?.folder) {
      // refetch the document path
      // TODO: Optimize by checking if the current folder is in the document path
      if (document && documentPathIds.includes(props.folderId)) {
        const documentPath = await getDocumentPath(urqlClient, document.id);
        documentPathStore.update(documentPath);
      }
    } else {
      // TODO: show error: couldn't update folder name
    }
    setIsEditing("none");
  };

  const deleteFolder = async (folderId: string) => {
    const deleteFoldersResult = await deleteFoldersMutation({
      input: {
        ids: [folderId],
      },
    });
    if (deleteFoldersResult.data && deleteFoldersResult.data.deleteFolders) {
      props.onStructureChange();
    } else {
      // TODO: show error: couldn't delete folder
    }
  };

  const styles = StyleSheet.create({
    folder: tw``,
    hover: tw`bg-gray-200`,
    focusVisible: Platform.OS === "web" ? tw`se-inset-focus-mini` : {},
  });

  const maxWidth = 32 - depth * 2;

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
              tw`grow-1 pl-${depth * 3}`, // needed so clickable area is as large as possible
            ]}
            // disable default outline styles and add 1 overridden style manually (grow)
            _focusVisible={{
              _web: { style: { outlineWidth: 0, flexGrow: 1 } },
            }}
          >
            <HStack
              alignItems="center"
              style={tw`py-3 md:py-1.5 pl-3.5 md:pl-2.5`}
            >
              <View style={tw`ml-${depth} md:ml-0`}>
                <Icon
                  name={isOpen ? "arrow-down-filled" : "arrow-right-filled"}
                  color={tw.color(isDesktopDevice ? "gray-600" : "gray-400")}
                  mobileSize={5}
                />
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
                  value={props.folderName}
                  style={tw`ml-0.5 w-${maxWidth}`}
                />
              ) : (
                <Text
                  variant="small"
                  style={tw`ml-1.5 max-w-${maxWidth}`}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  bold={documentPathIds.includes(props.folderId)}
                >
                  {props.folderName}
                </Text>
              )}
            </HStack>
          </Pressable>

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

          {(isHovered || !isDesktopDevice) && (
            <HStack alignItems="center" space={1} style={tw`pr-3 md:pr-2`}>
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
              <Tooltip label="New Page" placement="right" offset={8}>
                <IconButton
                  onPress={createDocument}
                  name="file-add-line"
                  color="gray-600"
                  style={tw`p-2 md:p-0`}
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
                    workspaceId={props.workspaceId}
                    folderName={folder.name}
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
                    documentId={document.id}
                    documentName={document.name || "Untitled"}
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
