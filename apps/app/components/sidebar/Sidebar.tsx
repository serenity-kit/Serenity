import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import { useNavigation, useRoute } from "@react-navigation/native";
import { encryptFolderName } from "@serenity-tools/common";
import {
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
import { useEffect, useState } from "react";
import { useClient } from "urql";
import { v4 as uuidv4 } from "uuid";
import {
  useCreateFolderMutation,
  useMeQuery,
  useRootFoldersQuery,
  Workspace,
} from "../../generated/graphql";
import { useWorkspaceContext } from "../../hooks/useWorkspaceContext";
import { RootStackScreenProps } from "../../types/navigation";
import { getWorkspace } from "../../utils/workspace/getWorkspace";
import { getWorkspaceKey } from "../../utils/workspace/getWorkspaceKey";
import { getWorkspaces } from "../../utils/workspace/getWorkspaces";
import AccountMenu from "../accountMenu/AccountMenu";
import Folder from "../sidebarFolder/SidebarFolder";
import { CreateWorkspaceModal } from "../workspace/CreateWorkspaceModal";

export default function Sidebar(props: DrawerContentComponentProps) {
  const urqlClient = useClient();
  const route = useRoute<RootStackScreenProps<"Workspace">["route"]>();
  const navigation = useNavigation();
  const { sessionKey, activeDevice } = useWorkspaceContext();
  const workspaceId = route.params.workspaceId;
  const [isCreatingNewFolder, setIsCreatingNewFolder] = useState(false);
  const isPermanentLeftSidebar = useIsPermanentLeftSidebar();
  const [meResult] = useMeQuery();
  const [username, setUsername] = useState<string>("");
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[] | null | undefined>(
    null
  );
  const [rootFoldersResult, refetchRootFolders] = useRootFoldersQuery({
    variables: {
      workspaceId,
      first: 20,
    },
  });
  const [, createFolderMutation] = useCreateFolderMutation();
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] =
    useState(false);

  useEffect(() => {
    if (meResult.data && meResult.data.me) {
      if (meResult.data.me.username) {
        setUsername(meResult.data.me.username);
      } else {
        // TODO: error! Couldn't fetch user
      }
    }
  }, [meResult.fetching, meResult.data]);

  useEffect(() => {
    (async () => {
      if (!sessionKey) {
        throw new Error("Expected sessionKey to be defined");
      }
      const deviceSigningPublicKey = activeDevice?.signingPublicKey;
      if (!deviceSigningPublicKey) {
        throw new Error("Expected deviceSigningPublicKey to be defined");
      }
      try {
        const workspace = await getWorkspace({
          urqlClient,
          deviceSigningPublicKey,
          workspaceId,
        });
        setWorkspace(workspace);
        const workspaces = await getWorkspaces({
          urqlClient,
          deviceSigningPublicKey,
        });
        setWorkspaces(workspaces);
      } catch (error) {
        // TODO: handle unauthenticated graphql error
        // this happens when the user logs out, prior to
        // being navigated to the login screen
        console.error("sidebar tried to get workspace without authentication");
      }
    })();
  }, [
    urqlClient,
    navigation,
    workspaceId,
    sessionKey,
    activeDevice?.signingPublicKey,
  ]);

  const onWorkspaceStructureCreated = async ({
    workspace,
    folder,
    document,
  }) => {
    const deviceSigningPublicKey = activeDevice?.signingPublicKey;
    if (!deviceSigningPublicKey) {
      throw new Error("Expected deviceSigningPublicKey to be defined");
    }

    const createdWorkspace = await getWorkspace({
      urqlClient,
      deviceSigningPublicKey,
      workspaceId,
    });
    setWorkspace(createdWorkspace);
    setShowCreateWorkspaceModal(false);
    if (createdWorkspace) {
      navigation.navigate("Workspace", {
        workspaceId: workspace.id,
        screen: "Page",
        params: {
          pageId: document.id,
        },
      });
    } else {
      // TODO: handle this error
      console.error("No workspace found!");
    }
  };

  const createFolder = async (name: string) => {
    const id = uuidv4();
    let workspaceKey: string | undefined = undefined;
    try {
      workspaceKey = await getWorkspaceKey({
        workspaceId: workspaceId,
        urqlClient,
        activeDevice,
      });
    } catch (error: any) {
      // TODO: handle device not registered error
      console.error(error);
      return;
    }
    if (!workspaceKey) {
      // TODO: handle device not registered error
      console.log("Could not get workspace key!");
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
          workspaceKeyId: workspace?.currentWorkspaceKey?.id!,
          subkeyId: encryptedFolderResult.folderSubkeyId,
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
          workspace={workspace}
          username={username}
          workspaces={workspaces}
          showCreateWorkspaceModal={() => setShowCreateWorkspaceModal(true)}
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
            params: { workspaceId: route.params.workspaceId },
          }}
          iconName={"settings-4-line"}
        >
          Settings
        </SidebarLink>

        <SidebarLink to={{ screen: "DevDashboard" }} iconName="dashboard-line">
          Dev Dashboard
        </SidebarLink>
      </View>

      {isPermanentLeftSidebar ? <SidebarDivider /> : null}

      <HStack
        justifyContent="space-between"
        alignItems="center"
        style={tw`ml-5 md:ml-4 mb-4 mr-5 md:mr-2`}
      >
        <Text variant={isPermanentLeftSidebar ? "xxs" : "sm"} bold>
          Folders
        </Text>
        {/* offset not working yet as NB has a no-no in their component */}
        <Tooltip label="Create folder" placement="right" offset={8}>
          <IconButton
            onPress={() => {
              setIsCreatingNewFolder(true);
            }}
            name="plus"
            size={isPermanentLeftSidebar ? "md" : "lg"}
            testID="root-create-folder"
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
              workspaceId={route.params.workspaceId}
              onStructureChange={refetchRootFolders}
            />
          );
        })
      ) : null}
      <CreateWorkspaceModal
        isVisible={showCreateWorkspaceModal}
        onBackdropPress={() => setShowCreateWorkspaceModal(false)}
        onWorkspaceStructureCreated={onWorkspaceStructureCreated}
      />
    </DrawerContentScrollView>
  );
}
