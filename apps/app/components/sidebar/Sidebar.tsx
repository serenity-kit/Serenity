import { DrawerContentScrollView } from "@react-navigation/drawer";
import { Button, Link, useIsPermanentLeftSidebar } from "@serenity-tools/ui";

export default function Sidebar(props) {
  const isPermanentLeftSidebar = useIsPermanentLeftSidebar();

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
    </DrawerContentScrollView>
  );
}
