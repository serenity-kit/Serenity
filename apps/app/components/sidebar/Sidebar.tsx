import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import {
  encryptFolderName,
  folderDerivedKeyContext,
  generateId,
} from "@serenity-tools/common";
import { createSubkeyId } from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";
import {
  Heading,
  HorizontalDivider,
  Icon,
  IconButton,
  InlineInput,
  SidebarLink,
  Text,
  Tooltip,
  View,
  tw,
  useIsDesktopDevice,
  useIsPermanentLeftSidebar,
} from "@serenity-tools/ui";
import { HStack } from "native-base";
import { useState } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import {
  runCreateFolderMutation,
  useMeWithWorkspaceLoadingInfoQuery,
  useRootFoldersQuery,
} from "../../generated/graphql";
import { useAuthenticatedAppContext } from "../../hooks/useAuthenticatedAppContext";
import { createFolderKeyDerivationTrace } from "../../utils/folder/createFolderKeyDerivationTrace";
import { retrieveCurrentWorkspaceKey } from "../../utils/workspace/retrieveCurrentWorkspaceKey";
import AccountMenu from "../accountMenu/AccountMenu";
import SidebarFolder from "../sidebarFolder/SidebarFolder";
import { CreateWorkspaceModal } from "../workspace/CreateWorkspaceModal";

export default function Sidebar(props: DrawerContentComponentProps) {
  const { activeDevice } = useAuthenticatedAppContext();
  const { workspaceId } = useWorkspace();
  const [isCreatingNewFolder, setIsCreatingNewFolder] = useState(false);
  const isPermanentLeftSidebar = useIsPermanentLeftSidebar();
  const isDesktopDevice = useIsDesktopDevice();

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
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] =
    useState(false);

  const createFolder = async (name: string) => {
    const folderId = generateId();
    let workspaceKey: string | undefined = undefined;
    let workspaceKeyId: string | undefined = undefined;
    try {
      const result = await retrieveCurrentWorkspaceKey({
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
    const keyDerivationTrace = await createFolderKeyDerivationTrace({
      workspaceKeyId,
      folderId: null,
    });

    const folderSubkeyId = createSubkeyId();
    keyDerivationTrace.trace.push({
      entryId: folderId,
      subkeyId: folderSubkeyId,
      parentId: null,
      context: folderDerivedKeyContext,
    });
    const encryptedFolderResult = encryptFolderName({
      name,
      parentKey: workspaceKey,
      folderId,
      keyDerivationTrace,
      subkeyId: folderSubkeyId,
      workspaceId,
    });

    const createFolderMutationResult = await runCreateFolderMutation(
      {
        input: {
          id: folderId,
          workspaceId,
          nameCiphertext: encryptedFolderResult.ciphertext,
          nameNonce: encryptedFolderResult.nonce,
          workspaceKeyId,
          subkeyId: encryptedFolderResult.folderSubkeyId,
          keyDerivationTrace,
        },
      },
      {}
    );
    if (createFolderMutationResult.data?.createFolder?.folder?.id) {
    } else {
      console.error(createFolderMutationResult.error);
      alert("Failed to create a folder. Please try again.");
    }

    setIsCreatingNewFolder(false);
    refetchRootFolders();
  };

  return (
    // TODO override for now until we find out where the pt-1 comes from
    <DrawerContentScrollView
      {...props}
      style={[
        tw`bg-gray-100 -mt-1 pb-4`,
        isDesktopDevice &&
          !isPermanentLeftSidebar &&
          tw`border-r border-gray-200`,
      ]}
    >
      <HStack
        alignItems="center"
        justifyContent="space-between"
        style={[
          tw`h-12 pr-2.5 pl-5 md:px-4`,
          !isDesktopDevice && tw`border-b border-gray-200`,
        ]}
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
            size={isDesktopDevice ? "md" : "xl"}
          ></IconButton>
        )}
      </HStack>

      <View style={isDesktopDevice ? tw`pt-4` : tw`pt-5 pb-7`}>
        <SidebarLink
          to={{
            screen: "Workspace",
            params: {
              workspaceId,
              screen: "WorkspaceSettings",
            },
          }}
          iconName={"settings-4-line"}
          disabled={!isAuthorizedForThisWorkspace}
        >
          Settings
        </SidebarLink>
      </View>

      {isDesktopDevice ? <HorizontalDivider /> : null}

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
                size={isDesktopDevice ? "md" : "lg"}
                testID="root-create-folder"
                color={isDesktopDevice ? "gray-400" : "gray-600"}
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
                <SidebarFolder
                  key={folder.id}
                  folderId={folder.id}
                  parentFolderId={folder.parentFolderId}
                  nameCiphertext={folder.nameCiphertext}
                  nameNonce={folder.nameNonce}
                  subkeyId={
                    folder.keyDerivationTrace.trace[
                      folder.keyDerivationTrace.trace.length - 1
                    ].subkeyId
                  }
                  keyDerivationTrace={folder.keyDerivationTrace}
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
