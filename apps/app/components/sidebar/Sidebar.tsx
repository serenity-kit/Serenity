import {
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from "@react-navigation/drawer";

import {
  Button,
  Icon,
  InlineInput,
  Menu,
  Pressable,
  SidebarButton,
  SidebarDivider,
  SidebarLink,
  Text,
  tw,
  useIsPermanentLeftSidebar,
  View,
  Avatar,
} from "@serenity-tools/ui";
import { CreateWorkspaceModal } from "../workspace/CreateWorkspaceModal";
import {
  useWorkspacesQuery,
  useWorkspaceQuery,
  useCreateFolderMutation,
  useRootFoldersQuery,
  useMeQuery,
} from "../../generated/graphql";
import { v4 as uuidv4 } from "uuid";
import { useNavigation, useRoute } from "@react-navigation/native";
import { RootStackScreenProps } from "../../types";
import { useAuthentication } from "../../context/AuthenticationContext";
import { HStack } from "native-base";
import { useEffect, useState } from "react";
import Folder from "../sidebarFolder/SidebarFolder";

export default function Sidebar(props: DrawerContentComponentProps) {
  const route = useRoute<RootStackScreenProps<"Workspace">["route"]>();
  const navigation = useNavigation();
  const [isOpenWorkspaceSwitcher, setIsOpenWorkspaceSwitcher] = useState(false);
  const [isCreatingNewFolder, setIsCreatingNewFolder] = useState(false);
  const isPermanentLeftSidebar = useIsPermanentLeftSidebar();
  const [workspacesResult, refetchWorkspacesResult] = useWorkspacesQuery();
  const [meResult] = useMeQuery();
  const [username, setUsername] = useState<string>("");
  const [workspaceResult] = useWorkspaceQuery({
    variables: {
      id: route.params.workspaceId,
    },
  });
  const [rootFoldersResult, refetchRootFolders] = useRootFoldersQuery({
    variables: {
      workspaceId: route.params.workspaceId,
      first: 20,
    },
  });

  const [, createFolderMutation] = useCreateFolderMutation();
  const { updateAuthentication } = useAuthentication();
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
  }, [meResult.fetching]);

  const onWorkspaceCreated = (workspace: { id: string }) => {
    refetchWorkspacesResult();
    setShowCreateWorkspaceModal(false);
    navigation.navigate("Workspace", {
      workspaceId: workspace.id,
      screen: "Dashboard",
    });
  };

  const createFolder = async (name: string) => {
    const id = uuidv4();
    const result = await createFolderMutation({
      input: { id, workspaceId: route.params.workspaceId, name },
    });
    if (result.data?.createFolder?.folder?.id) {
      console.log("created a folder");
    } else {
      console.error(result.error);
      alert("Failed to create a folder. Please try again.");
    }
    setIsCreatingNewFolder(false);
    refetchRootFolders();
  };

  return (
    // TODO override for now until we find out where the pt-1 comes from
    <DrawerContentScrollView {...props} style={tw`bg-gray-100 -mt-1`}>
      <HStack
        alignItems="center"
        justifyContent="space-between"
        style={tw`py-3 px-4`}
      >
        <Menu
          placement="bottom left"
          style={tw`ml-4`} // we could solve this via additional margin but that's kinda hacky ...
          offset={2}
          // can never be more than half the trigger width !! should be something like 16+24+8+labellength*12-24
          // or we only use the icon as the trigger (worsens ux)
          crossOffset={120}
          isOpen={isOpenWorkspaceSwitcher}
          onChange={setIsOpenWorkspaceSwitcher}
          trigger={
            <Pressable accessibilityLabel="More options menu">
              <HStack space={2} alignItems="center">
                <Avatar
                  borderRadius={4}
                  size="xs"
                  bg={tw.color("primary-400")}
                  source={{}} // TODO add workspace image source here
                >
                  {/* TODO show conditionally when no image-source is set */}
                  <Icon
                    name="serenity-feather"
                    color={tw.color("black/40")}
                    size={20}
                  />
                </Avatar>
                <Text
                  variant="xs"
                  bold
                  style={tw`-mr-1 max-w-30`} // -mr needed for icon spacing, max-w needed for ellipsis
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {workspaceResult.fetching
                    ? " "
                    : workspaceResult.data?.workspace?.name}
                </Text>
                <Icon
                  name="arrow-down-s-line"
                  size={16}
                  color={tw.color("gray-400")}
                />
              </HStack>
            </Pressable>
          }
        >
          <View style={tw`p-4`}>
            <Text variant="small" muted>
              {username}
            </Text>
          </View>
          {workspacesResult.fetching
            ? null
            : workspacesResult.data?.workspaces?.nodes?.map((workspace) =>
                workspace === null || workspace === undefined ? null : (
                  <SidebarLink
                    key={workspace.id}
                    to={{
                      screen: "Workspace",
                      params: {
                        workspaceId: workspace.id,
                        screen: "Dashboard",
                      },
                    }}
                  >
                    <Text variant="small">{workspace.name}</Text>
                  </SidebarLink>
                )
              )}
          <SidebarDivider collapsed />

          <SidebarButton
            onPress={() => {
              setIsOpenWorkspaceSwitcher(false);
              setShowCreateWorkspaceModal(true);
            }}
          >
            <Text variant="small">Create workspace</Text>
          </SidebarButton>

          <SidebarDivider collapsed />
          <SidebarButton
            onPress={() => {
              setIsOpenWorkspaceSwitcher(false);
              updateAuthentication(null);
              // @ts-expect-error navigation ts issue
              props.navigation.push("Login");
            }}
          >
            <Text variant="small">Logout</Text>
          </SidebarButton>
        </Menu>
        {!isPermanentLeftSidebar && (
          <Pressable
            onPress={() => {
              props.navigation.closeDrawer();
            }}
            style={tw`icon-button`}
          >
            <Icon
              size={16}
              name="double-arrow-left"
              color={tw.color("gray-400")}
            />
          </Pressable>
        )}
      </HStack>

      <SidebarLink
        to={{
          screen: "Workspace",
          params: { workspaceId: route.params.workspaceId, screen: "Settings" },
        }}
      >
        <Icon name="settings-4-line" size={18} color={tw.color("gray-800")} />
        <Text variant="small">Settings</Text>
      </SidebarLink>
      <SidebarLink to={{ screen: "DevDashboard" }}>
        <Icon name="dashboard-line" size={18} color={tw.color("gray-800")} />
        <Text variant="small">Dev Dashboard</Text>
      </SidebarLink>
      <SidebarLink
        to={{
          screen: "Workspace",
          params: { workspaceId: route.params.workspaceId, screen: "Editor" },
        }}
      >
        <Icon name="draft-line" size={18} color={tw.color("gray-800")} />
        <Text variant="small">Editor</Text>
      </SidebarLink>
      <SidebarLink
        to={{
          screen: "Workspace",
          params: {
            workspaceId: route.params.workspaceId,
            screen: "TestLibsodium",
          },
        }}
      >
        <Icon name="microscope-line" size={18} color={tw.color("gray-800")} />
        <Text variant="small">Libsodium Test Screen</Text>
      </SidebarLink>

      <SidebarDivider />

      <SidebarButton
        onPress={() => {
          setIsCreatingNewFolder(true);
        }}
      >
        <Text variant="small">Create a Folder</Text>
      </SidebarButton>

      <SidebarDivider />

      <Text variant="xxs" bold style={tw`ml-4 mb-4`}>
        Documents
      </Text>

      {isCreatingNewFolder && (
        <InlineInput
          onCancel={() => {
            setIsCreatingNewFolder(false);
          }}
          onSubmit={createFolder}
          value=""
        />
      )}

      {rootFoldersResult.fetching ? (
        <Text>Loading Folders…</Text>
      ) : rootFoldersResult.data?.rootFolders?.nodes ? (
        rootFoldersResult.data?.rootFolders?.nodes.map((folder) => {
          if (folder === null) {
            return null;
          }
          return (
            <Folder
              key={folder.id}
              folderId={folder.id}
              folderName={folder.name}
              workspaceId={route.params.workspaceId}
              onStructureChange={refetchRootFolders}
            />
          );
        })
      ) : null}

      <CreateWorkspaceModal
        isVisible={showCreateWorkspaceModal}
        onBackdropPress={() => setShowCreateWorkspaceModal(false)}
        onWorkspaceCreated={onWorkspaceCreated}
      />
    </DrawerContentScrollView>
  );
}
