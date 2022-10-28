import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import { StyleSheet } from "react-native";

import { Heading, SidebarLink, tw } from "@serenity-tools/ui";

export default function AccountSettingsSidebar(
  props: DrawerContentComponentProps
) {
  const currentRouteName = props.state.routeNames[props.state.index];

  const styles = StyleSheet.create({
    active: tw`bg-primary-200 `,
  });

  return (
    <DrawerContentScrollView {...props} style={tw`bg-gray-100 py-4`}>
      <Heading lvl={4} style={tw`px-4 pb-4`}>
        Account Settings
      </Heading>
      <SidebarLink
        to={{
          screen: "AccountSettings",
          params: { screen: "Profile" },
        }}
        iconName="user-line"
        active={currentRouteName === "Profile"}
      >
        Profile
      </SidebarLink>
      <SidebarLink
        to={{
          screen: "AccountSettings",
          params: { screen: "Devices" },
        }}
        iconName="device-line"
        active={currentRouteName === "Devices"}
      >
        Devices
      </SidebarLink>
    </DrawerContentScrollView>
  );
}
