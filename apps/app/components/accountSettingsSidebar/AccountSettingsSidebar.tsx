import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from "@react-navigation/drawer";

import { SidebarLink, Text, tw } from "@serenity-tools/ui";

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
        <Text>
          Profile {currentRouteName === "Profile" ? "(active)" : null}
        </Text>
      </SidebarLink>
      <SidebarLink
        to={{
          screen: "AccountSettings",
          params: { screen: "Devices" },
        }}
      >
        <Text>
          Devices {currentRouteName === "Devices" ? "(active)" : null}
        </Text>
      </SidebarLink>
    </DrawerContentScrollView>
  );
}
