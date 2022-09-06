import {
  SidebarLink,
  tw,
  ScrollSafeAreaView,
  Icon,
  Text,
} from "@serenity-tools/ui";
import { useWindowDimensions } from "react-native";

export default function DevDashboardScreen(props) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing

  return (
    <ScrollSafeAreaView style={tw`px-4 py-6`}>
      <SidebarLink to={{ screen: "Root" }}>
        <Icon
          name="dashboard-line"
          size={4.5}
          mobileSize={5.5}
          color={"gray-800"}
        />
        <Text>Home</Text>
      </SidebarLink>
      <SidebarLink to={{ screen: "DesignSystem" }}>
        <Icon
          name="dashboard-line"
          size={4.5}
          mobileSize={5.5}
          color={"gray-800"}
        />
        <Text>Design System</Text>
      </SidebarLink>
      <SidebarLink to={{ screen: "TestLibsodium" }}>
        <Icon
          name="dashboard-line"
          size={4.5}
          mobileSize={5.5}
          color={"gray-800"}
        />
        <Text>Libsodium Test Screen</Text>
      </SidebarLink>
      <SidebarLink to={{ screen: "EncryptDecryptImageTest" }}>
        <Icon
          name="dashboard-line"
          size={4.5}
          mobileSize={5.5}
          color={"gray-800"}
        />
        <Text>Encrypt / Decrypt Image</Text>
      </SidebarLink>
      <SidebarLink to={{ screen: "AccountSettings" }}>
        <Icon
          name="dashboard-line"
          size={4.5}
          mobileSize={5.5}
          color={"gray-800"}
        />
        <Text>User settings</Text>
      </SidebarLink>
    </ScrollSafeAreaView>
  );
}
