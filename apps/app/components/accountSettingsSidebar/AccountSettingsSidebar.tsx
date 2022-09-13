import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from "@react-navigation/drawer";

import { Icon, SidebarLink, Text, tw } from "@serenity-tools/ui";

export default function AccountSettingsSidebar(
  props: DrawerContentComponentProps
) {
  const currentRouteName = props.state.routeNames[props.state.index];
  return (
    <DrawerContentScrollView {...props} style={tw`bg-gray-100 -mt-1 pb-4`}>
      <SidebarLink
        to={{
          screen: "AccountSettings",
          params: { screen: "Profile" },
        }}
      >
        <Icon name="user-line" color={"gray-800"} />
        <Text variant="xs">
          Profile {currentRouteName === "Profile" ? "(active)" : null}
        </Text>
      </SidebarLink>
      <SidebarLink
        to={{
          screen: "AccountSettings",
          params: { screen: "Devices" },
        }}
      >
        <Icon name="device-line" color={"gray-800"} />
        <Text variant="xs">
          Devices {currentRouteName === "Devices" ? "(active)" : null}
        </Text>
      </SidebarLink>
    </DrawerContentScrollView>
  );
}
