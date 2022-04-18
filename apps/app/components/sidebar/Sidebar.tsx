import { DrawerContentScrollView } from "@react-navigation/drawer";
import { Link } from "@serenity-tools/ui";

export default function Sidebar(props) {
  return (
    <DrawerContentScrollView {...props}>
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
