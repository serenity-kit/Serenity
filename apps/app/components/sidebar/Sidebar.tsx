import { DrawerContentScrollView } from "@react-navigation/drawer";
import {
  Button,
  Link,
  useIsPermanentLeftSidebar,
  View,
  Text,
} from "@serenity-tools/ui";
import { useWorkspacesQuery } from "../../generated/graphql";

export default function Sidebar(props) {
  const isPermanentLeftSidebar = useIsPermanentLeftSidebar();
  const [workspacesResult] = useWorkspacesQuery();

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
      <Link to={{ screen: "App", params: { screen: "Editor" } }}>Editor</Link>
      <Link to={{ screen: "App", params: { screen: "TestEditor" } }}>
        Sync-Test-Editor
      </Link>
      <Link to={{ screen: "App", params: { screen: "TestLibsodium" } }}>
        Libsodium Test Screen
      </Link>
      <View>
        {workspacesResult.fetching
          ? null
          : workspacesResult.data?.workspaces?.nodes?.map((workspace) => (
              <Text>{workspace?.name}</Text>
            ))}
      </View>
    </DrawerContentScrollView>
  );
}
