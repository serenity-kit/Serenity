import { DrawerContentScrollView } from "@react-navigation/drawer";
import {
  Button,
  Link,
  useIsPermanentLeftSidebar,
  View,
} from "@serenity-tools/ui";
import {
  useWorkspacesQuery,
  useCreateWorkspaceMutation,
} from "../../generated/graphql";
import { v4 as uuidv4 } from "uuid";
import { useRoute } from "@react-navigation/native";
import { RootStackScreenProps } from "../../types";

export default function Sidebar(props) {
  const route = useRoute<RootStackScreenProps<"Workspace">["route"]>();
  const isPermanentLeftSidebar = useIsPermanentLeftSidebar();
  const [workspacesResult, refetchWorkspacesResult] = useWorkspacesQuery();
  const [, createWorkspaceResult] = useCreateWorkspaceMutation();

  const createWorkspace = async () => {
    const name =
      window.prompt("Enter a workspace name") || uuidv4().substring(0, 8);
    const id = uuidv4();
    await createWorkspaceResult({
      input: {
        name,
        id,
      },
    });
    refetchWorkspacesResult();
  };

  return (
    <DrawerContentScrollView {...props}>
      {!isPermanentLeftSidebar && (
        <Button
          onPress={() => {
            props.navigation.closeDrawer();
          }}
        >
          Close Sidebar
        </Button>
      )}
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
            screen: "TestEditor",
          },
        }}
      >
        Sync-Test-Editor
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
        {workspacesResult.fetching
          ? null
          : workspacesResult.data?.workspaces?.nodes?.map((workspace) =>
              workspace === null ? null : (
                <Link
                  key={workspace?.id}
                  to={{
                    screen: "Workspace",
                    params: { workspaceId: workspace.id, screen: "Dashboard" },
                  }}
                >
                  {workspace?.name}
                </Link>
              )
            )}
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
    </DrawerContentScrollView>
  );
}
