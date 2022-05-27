import {
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from "@react-navigation/drawer";

import { StyleSheet } from "react-native";
import {
  Button,
  Icon,
  Link,
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
import {
  useWorkspacesQuery,
  useCreateWorkspaceMutation,
  useCreateDocumentMutation,
  useDeleteDocumentsMutation,
  useUpdateDocumentNameMutation,
  useDocumentPreviewsQuery,
  useWorkspaceQuery,
} from "../../generated/graphql";
import { v4 as uuidv4 } from "uuid";
import { useRoute } from "@react-navigation/native";
import { RootStackScreenProps } from "../../types";
import { useAuthentication } from "../../context/AuthenticationContext";
import { useState } from "react";
import DocumentMenu from "../documentMenu/DocumentMenu";
import { HStack } from "native-base";

export default function Sidebar(props: DrawerContentComponentProps) {
  const route = useRoute<RootStackScreenProps<"Workspace">["route"]>();
  const [isOpenWorkspaceSwitcher, setIsOpenWorkspaceSwitcher] = useState(false);
  const [isOpenDocumentMenu, setIsOpenDocumentMenu] = useState(false);
  const isPermanentLeftSidebar = useIsPermanentLeftSidebar();
  const [workspacesResult, refetchWorkspacesResult] = useWorkspacesQuery();
  const [workspaceResult] = useWorkspaceQuery({
    variables: {
      id: route.params.workspaceId,
    },
  });

  const [, createWorkspaceMutation] = useCreateWorkspaceMutation();
  const [, createDocumentMutation] = useCreateDocumentMutation();
  const [, deleteDocumentsMutation] = useDeleteDocumentsMutation();
  const [, updateDocumentNameMutation] = useUpdateDocumentNameMutation();
  const [documentPreviewsResult, refetchDocumentPreviews] =
    useDocumentPreviewsQuery({
      variables: { workspaceId: route.params.workspaceId },
    });
  const { updateAuthentication } = useAuthentication();

  const createWorkspace = async () => {
    const name =
      window.prompt("Enter a workspace name") || uuidv4().substring(0, 8);
    const id = uuidv4();
    await createWorkspaceMutation({
      input: {
        name,
        id,
      },
    });
    refetchWorkspacesResult();
  };

  const createDocument = async () => {
    const id = uuidv4();
    const result = await createDocumentMutation({
      input: { id, workspaceId: route.params.workspaceId },
    });
    if (result.data?.createDocument?.id) {
      props.navigation.navigate("Workspace", {
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
    refetchDocumentPreviews();
  };

  const deleteDocument = async (id: string) => {
    await deleteDocumentsMutation({
      input: {
        ids: [id],
      },
    });
    refetchDocumentPreviews();
  };

  const updateDocumentName = async (id: string) => {
    const name = window.prompt("Enter a document name");
    if (name && name.length > 0) {
      // refetchDocumentPreviews no necessary since a document is returned
      // and therefor the cache automatically updated
      await updateDocumentNameMutation({
        input: {
          id,
          name,
        },
      });
    }
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
              jane@example.com
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
              createWorkspace();
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

      <SidebarButton onPress={createDocument}>
        <Text variant="small">Create Page</Text>
      </SidebarButton>

      <SidebarDivider />

      <Text variant="xxs" bold style={tw`ml-4 mb-4`}>
        Documents
      </Text>
      {documentPreviewsResult.fetching ? (
        <Text>Loading...</Text>
      ) : documentPreviewsResult.data?.documentPreviews?.nodes ? (
        documentPreviewsResult.data?.documentPreviews?.nodes.map(
          (documentPreview) => {
            if (documentPreview === null) {
              return null;
            }
            return (
              <View key={documentPreview.id} style={styles.documentPreviewItem}>
                <Link
                  style={styles.documentPreviewLabel}
                  to={{
                    screen: "Workspace",
                    params: {
                      workspaceId: route.params.workspaceId,
                      screen: "Page",
                      params: {
                        pageId: documentPreview.id,
                      },
                    },
                  }}
                >
                  {documentPreview?.name}
                </Link>
                <DocumentMenu
                  documentId={documentPreview.id}
                  refetchDocumentPreviews={refetchDocumentPreviews}
                />
              </View>
            );
          }
        )
      ) : null}
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  documentPreviewItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  documentPreviewLabel: {
    flexGrow: 1,
    height: "100%",
  },
});
