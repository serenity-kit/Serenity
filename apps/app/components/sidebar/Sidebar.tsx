import { DrawerContentScrollView } from "@react-navigation/drawer";
import { StyleSheet } from "react-native";
import {
  Button,
  Icon,
  Link,
  Menu,
  MenuItem,
  Pressable,
  Text,
  tw,
  useIsPermanentLeftSidebar,
  View,
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

export default function Sidebar(props) {
  const route = useRoute<RootStackScreenProps<"Workspace">["route"]>();
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
      const updatedDocument = await updateDocumentNameMutation({
        input: {
          id,
          name,
        },
      });
      refetchDocumentPreviews();
    }
  };

  return (
    <DrawerContentScrollView {...props} style={tw`bg-gray-100`}>
      {!isPermanentLeftSidebar && (
        <Button
          onPress={() => {
            props.navigation.closeDrawer();
          }}
        >
          Close Sidebar
        </Button>
      )}
      <View>
        <Menu
          trigger={(triggerProps) => {
            return (
              <Pressable
                accessibilityLabel="More options menu"
                {...triggerProps}
                style={tw`flex flex-row`}
              >
                <Text>
                  {workspaceResult.fetching
                    ? " "
                    : workspaceResult.data?.workspace?.name}
                </Text>
                <Icon name="arrow-down-s-fill" />
              </Pressable>
            );
          }}
        >
          {workspacesResult.fetching
            ? null
            : workspacesResult.data?.workspaces?.nodes?.map((workspace) =>
                workspace === null || workspace === undefined ? null : (
                  <Link
                    key={workspace.id}
                    to={{
                      screen: "Workspace",
                      params: {
                        workspaceId: workspace.id,
                        screen: "Dashboard",
                      },
                    }}
                  >
                    {workspace.name}
                  </Link>
                )
              )}
        </Menu>
        {workspacesResult.fetching
          ? null
          : workspacesResult.data?.workspaces?.nodes?.map((workspace) =>
              workspace === null || workspace === undefined ? null : (
                <Link
                  key={workspace.id}
                  to={{
                    screen: "Workspace",
                    params: {
                      workspaceId: workspace.id,
                      screen: "Dashboard",
                    },
                  }}
                >
                  {workspace.name}
                </Link>
              )
            )}
      </View>

      <Link
        to={{
          screen: "Workspace",
          params: { workspaceId: route.params.workspaceId, screen: "Settings" },
        }}
      >
        Settings
      </Link>
      <Link to={{ screen: "DevDashboard" }}>Dev Dashboard</Link>
      <Link
        to={{
          screen: "Workspace",
          params: { workspaceId: route.params.workspaceId, screen: "Editor" },
        }}
      >
        Editor
      </Link>
      <Link
        to={{
          screen: "Workspace",
          params: {
            workspaceId: route.params.workspaceId,
            screen: "TestLibsodium",
          },
        }}
      >
        Libsodium Test Screen
      </Link>
      <View>
        <Button onPress={createDocument}>Create Page</Button>
      </View>
      <View>
        <Button
          onPress={() => {
            createWorkspace();
          }}
        >
          Create workspace
        </Button>
      </View>
      <View>
        <Button
          onPress={() => {
            // TODO clear cache and wipe local data?
            localStorage.removeItem("deviceSigningPublicKey");
            props.navigation.navigate("Login");
          }}
        >
          Logout
        </Button>
      </View>
      <Text>Documents</Text>
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
                <Button
                  onPress={() => {
                    updateDocumentName(documentPreview?.id);
                  }}
                >
                  Change Name
                </Button>
                <Button
                  onPress={() => {
                    deleteDocument(documentPreview?.id);
                  }}
                >
                  Delete
                </Button>
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
    border: "1px solid black",
    alignItems: "center",
  },
  documentPreviewLabel: {
    border: "1px solid black",
    flexGrow: 1,
    height: "100%",
  },
});
