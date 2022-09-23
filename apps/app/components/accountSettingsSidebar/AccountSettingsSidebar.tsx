import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from "@react-navigation/drawer";

import { SidebarLink, tw } from "@serenity-tools/ui";

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
        iconName="user-line"
      >
        Profile {currentRouteName === "Profile" ? "(active)" : null}
      </SidebarLink>
      <SidebarLink
        to={{
          screen: "AccountSettings",
          params: { screen: "Devices" },
        }}
        iconName="device-line"
      >
        Devices {currentRouteName === "Devices" ? "(active)" : null}
      </SidebarLink>
    </DrawerContentScrollView>
  );
}
