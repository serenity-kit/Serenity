import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Button,
  ScrollSafeAreaView,
  SidebarLink,
  tw,
} from "@serenity-tools/ui";
import { useWindowDimensions } from "react-native";
import { RootStackScreenProps } from "../../../types/navigationProps";

export default function DevDashboardScreen(
  props: RootStackScreenProps<"DevDashboard">
) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing

  return (
    <ScrollSafeAreaView style={tw`py-6`}>
      <SidebarLink to={{ screen: "Root" }} iconName="dashboard-line">
        Home
      </SidebarLink>
      <SidebarLink to={{ screen: "DesignSystem" }} iconName="dashboard-line">
        Design System
      </SidebarLink>
      <SidebarLink to={{ screen: "UITest" }} iconName="dashboard-line">
        UI Testing Area
      </SidebarLink>
      <SidebarLink to={{ screen: "TestLibsodium" }} iconName="dashboard-line">
        Libsodium Test Screen
      </SidebarLink>
      <SidebarLink
        to={{ screen: "EncryptDecryptImageTest" }}
        iconName="dashboard-line"
      >
        Encrypt / Decrypt Image
      </SidebarLink>
      <SidebarLink to={{ screen: "AccountSettings" }} iconName="dashboard-line">
        User settings
      </SidebarLink>
      <Button
        onPress={async () => {
          const sqliteDebugger = await AsyncStorage.getItem("sqlite_debugger");
          if (sqliteDebugger === "active") {
            await AsyncStorage.removeItem("sqlite_debugger");
          } else {
            await AsyncStorage.setItem("sqlite_debugger", "active");
          }
        }}
      >
        Toggle Sqlite Debugger (manual refresh needed)
      </Button>
    </ScrollSafeAreaView>
  );
}
