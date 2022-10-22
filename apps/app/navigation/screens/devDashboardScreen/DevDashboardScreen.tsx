import { ScrollSafeAreaView, SidebarLink, tw } from "@serenity-tools/ui";
import { useWindowDimensions } from "react-native";

export default function DevDashboardScreen(props) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing

  return (
    <ScrollSafeAreaView style={tw`py-6`}>
      <SidebarLink to={{ screen: "Root" }} iconName="dashboard-line">
        Home
      </SidebarLink>
      <SidebarLink to={{ screen: "DesignSystem" }} iconName="dashboard-line">
        Design System
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
      <SidebarLink to={{ screen: "FileUploadTest" }} iconName="dashboard-line">
        File Upload Test
      </SidebarLink>
      <SidebarLink to={{ screen: "AccountSettings" }} iconName="dashboard-line">
        User settings
      </SidebarLink>
    </ScrollSafeAreaView>
  );
}
