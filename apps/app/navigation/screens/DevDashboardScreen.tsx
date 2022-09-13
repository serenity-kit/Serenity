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
      <SidebarLink to={{ screen: "Root" }}>
        <SidebarIconLeft name="dashboard-line" />
        <SidebarText>Home</SidebarText>
      </SidebarLink>
      <SidebarLink to={{ screen: "DesignSystem" }}>
        <SidebarIconLeft name="dashboard-line" />
        <SidebarText>Design System</SidebarText>
      </SidebarLink>
      <SidebarLink to={{ screen: "TestLibsodium" }}>
        <SidebarIconLeft name="dashboard-line" />
        <SidebarText>Libsodium Test Screen</SidebarText>
      </SidebarLink>
      <SidebarLink to={{ screen: "EncryptDecryptImageTest" }}>
        <SidebarIconLeft name="dashboard-line" />
        <SidebarText>Encrypt / Decrypt Image</SidebarText>
      </SidebarLink>
      <SidebarLink to={{ screen: "AccountSettings" }}>
        <SidebarIconLeft name="dashboard-line" />
        <SidebarText>User settings</SidebarText>
      </SidebarLink>
    </ScrollSafeAreaView>
  );
}
