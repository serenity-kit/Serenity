import { DrawerContentScrollView } from "@react-navigation/drawer";
import { Button, Link } from "@serenity-tools/ui";
import useIsPermanentSidebar from "../../hooks/useIsPermanentSidebar";

export default function Sidebar(props) {
  const isPermanentSidebar = useIsPermanentSidebar();

  return (
    <DrawerContentScrollView {...props}>
      {!isPermanentSidebar && (
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
