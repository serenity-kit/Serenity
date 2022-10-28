import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import { useNavigation, useRoute } from "@react-navigation/native";
import { encryptFolderName } from "@serenity-tools/common";
import {
  Heading,
  Icon,
  IconButton,
  InlineInput,
  SidebarDivider,
  SidebarLink,
  Text,
  Tooltip,
  tw,
  useIsPermanentLeftSidebar,
  View,
} from "@serenity-tools/ui";
import { HStack } from "native-base";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  useCreateFolderMutation,
  useMeWithWorkspaceLoadingInfoQuery,
  useRootFoldersQuery,
} from "../../generated/graphql";
import { useWorkspaceContext } from "../../hooks/useWorkspaceContext";
import { RootStackScreenProps } from "../../types/navigation";
import { deriveCurrentWorkspaceKey } from "../../utils/workspace/deriveCurrentWorkspaceKey";
import AccountMenu from "../accountMenu/AccountMenu";
import Folder from "../sidebarFolder/SidebarFolder";
import { CreateWorkspaceModal } from "../workspace/CreateWorkspaceModal";

export default function Sidebar(props: DrawerContentComponentProps) {
  const route = useRoute<RootStackScreenProps<"Workspace">["route"]>();
  const navigation = useNavigation();
  const { activeDevice } = useWorkspaceContext();
  const workspaceId = route.params.workspaceId;
  const [isCreatingNewFolder, setIsCreatingNewFolder] = useState(false);
  const isPermanentLeftSidebar = useIsPermanentLeftSidebar();

  const [meWithWorkspaceLoadingInfo] = useMeWithWorkspaceLoadingInfoQuery({
    variables: {
      workspaceId,
      returnOtherWorkspaceIfNotFound: false,
    },
  });
  const isAuthorizedForThisWorkspace =
    meWithWorkspaceLoadingInfo.data?.me?.workspaceLoadingInfo?.isAuthorized ||
    false;
  const [rootFoldersResult, refetchRootFolders] = useRootFoldersQuery({
    variables: {
      workspaceId,
      first: 20,
    },
  });
  const [, createFolderMutation] = useCreateFolderMutation();
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] =
    useState(false);

  const createFolder = async (name: string) => {
    const id = uuidv4();
    let workspaceKey: string | undefined = undefined;
    let workspaceKeyId: string | undefined = undefined;
    try {
      const result = await deriveCurrentWorkspaceKey({
        workspaceId: workspaceId,
        activeDevice,
      });
      workspaceKey = result.workspaceKey;
      workspaceKeyId = result.id;
    } catch (error: any) {
      // TODO: handle device not registered error
      console.error(error);
      return;
    }
    if (!workspaceKey) {
      // TODO: handle device not registered error
      console.error("Could not get workspace key!");
      return;
    }
    const encryptedFolderResult = await encryptFolderName({
      name,
      parentKey: workspaceKey,
    });
    let didCreateFolderSucceed = false;
    let numCreateFolderAttempts = 0;
    let folderId: string | undefined = undefined;
    let result: any = undefined;
    do {
      numCreateFolderAttempts += 1;
      result = await createFolderMutation({
        input: {
          id,
          workspaceId: route.params.workspaceId,
          encryptedName: encryptedFolderResult.ciphertext,
          encryptedNameNonce: encryptedFolderResult.publicNonce,
          workspaceKeyId,
          subkeyId: encryptedFolderResult.folderSubkeyId,
          keyDerivationTrace: {
            workspaceKeyId,
            parentFolders: [],
          },
        },
      });
      if (result.data?.createFolder?.folder?.id) {
        didCreateFolderSucceed = true;
        folderId = result.data?.createFolder?.folder?.id;
      }
    } while (!didCreateFolderSucceed && numCreateFolderAttempts < 5);
    if (!folderId) {
      console.error(result.error);
      alert("Failed to create a folder. Please try again.");
    }
    setIsCreatingNewFolder(false);
    refetchRootFolders();
  };

  return (
    // TODO override for now until we find out where the pt-1 comes from
    <DrawerContentScrollView {...props} style={tw`bg-gray-100 -mt-1 pb-4`}>
      <HStack
        alignItems="center"
        justifyContent="space-between"
        style={tw`py-1.5 px-5 md:px-4`}
      >
        <AccountMenu
          workspaceId={workspaceId}
          openCreateWorkspace={() => setShowCreateWorkspaceModal(true)}
          testID="general"
        />
        {!isPermanentLeftSidebar && (
          <IconButton
            onPress={() => {
              props.navigation.closeDrawer();
            }}
            name="double-arrow-left"
            size={"lg"}
          ></IconButton>
        )}
      </HStack>

      {!isPermanentLeftSidebar ? <SidebarDivider collapsed /> : null}

      <View style={!isPermanentLeftSidebar && tw`pt-5 pb-7`}>
        <SidebarLink
          to={{
            screen: "WorkspaceSettings",
            params: { workspaceId },
          }}
          iconName={"settings-4-line"}
          // @ts-expect-error needs fixing in the SidebarLink types
          disabled={!isAuthorizedForThisWorkspace}
        >
          Settings
        </SidebarLink>

        <SidebarLink to={{ screen: "DevDashboard" }} iconName="dashboard-line">
          Dev Dashboard
        </SidebarLink>
      </View>

      {isPermanentLeftSidebar ? <SidebarDivider /> : null}

      {isAuthorizedForThisWorkspace ? (
        <>
          <HStack
            justifyContent="space-between"
            alignItems="center"
            style={tw`ml-5 md:ml-4 mb-3 md:mb-2 mr-4.5 md:mr-2`}
          >
            <Heading lvl={4}>Folders</Heading>
            {/* offset not working yet as NB has a no-no in their component */}
            <Tooltip label="Create folder" placement="right" offset={8}>
              <IconButton
                onPress={() => {
                  setIsCreatingNewFolder(true);
                }}
                name="plus"
                size={isPermanentLeftSidebar ? "md" : "lg"}
                testID="root-create-folder"
                color={isPermanentLeftSidebar ? "gray-400" : "gray-600"}
              ></IconButton>
            </Tooltip>
          </HStack>
          {isCreatingNewFolder && (
            <HStack alignItems="center" style={tw`py-1.5 pl-2.5`}>
              <View style={tw`ml-0.5 -mr-0.5`}>
                <Icon name={"arrow-right-filled"} color={"gray-600"} />
              </View>
              <Icon name="folder" size={5} mobileSize={8} />
              <InlineInput
                onCancel={() => {
                  setIsCreatingNewFolder(false);
                }}
                onSubmit={createFolder}
                value=""
                style={tw`ml-0.5`}
                testID={"sidebar-folder__edit-name"}
              />
            </HStack>
          )}

          {rootFoldersResult.fetching ? (
            <Text variant="xs" muted style={tw`py-1.5 pl-4`}>
              Loading Folders…
            </Text>
          ) : rootFoldersResult.data?.rootFolders?.nodes ? (
            rootFoldersResult.data?.rootFolders?.nodes.map((folder) => {
              if (folder === null) {
                return null;
              }
              return (
                <Folder
                  key={folder.id}
                  folderId={folder.id}
                  encryptedName={folder.encryptedName}
                  encryptedNameNonce={folder.encryptedNameNonce}
                  subkeyId={folder.subkeyId}
                  workspaceId={workspaceId}
                  onStructureChange={refetchRootFolders}
                />
              );
            })
          ) : null}
        </>
      ) : null}
      <CreateWorkspaceModal
        isVisible={showCreateWorkspaceModal}
        onCancel={() => setShowCreateWorkspaceModal(false)}
        onWorkspaceStructureCreated={() => {
          setShowCreateWorkspaceModal(false);
        }}
      />
    </DrawerContentScrollView>
  );
}
