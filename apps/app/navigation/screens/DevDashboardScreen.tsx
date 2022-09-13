import {
  SidebarLink,
  tw,
  ScrollSafeAreaView,
  SidebarIconLeft,
  SidebarText,
} from "@serenity-tools/ui";
import { useWindowDimensions } from "react-native";

export default function DevDashboardScreen(props) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing

  return (
    <ScrollSafeAreaView style={tw`py-6`}>
      <SidebarLink to={{ screen: "Root" }} icon="dashboard-line">
        Home
      </SidebarLink>
      <SidebarLink to={{ screen: "DesignSystem" }} icon="dashboard-line">
        Design System
      </SidebarLink>
      <SidebarLink to={{ screen: "TestLibsodium" }} icon="dashboard-line">
        Libsodium Test Screen
      </SidebarLink>
      <SidebarLink
        to={{ screen: "EncryptDecryptImageTest" }}
        icon="dashboard-line"
      >
        Encrypt / Decrypt Image
      </SidebarLink>
      <SidebarLink to={{ screen: "AccountSettings" }} icon="dashboard-line">
        User settings
      </SidebarLink>
    </ScrollSafeAreaView>
  );
}
