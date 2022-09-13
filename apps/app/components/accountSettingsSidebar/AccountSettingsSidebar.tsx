import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from "@react-navigation/drawer";

import {
  SidebarIconLeft,
  SidebarLink,
  SidebarText,
  tw,
} from "@serenity-tools/ui";

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
        <SidebarIconLeft name="user-line" />
        <SidebarText>
          Profile {currentRouteName === "Profile" ? "(active)" : null}
        </SidebarText>
      </SidebarLink>
      <SidebarLink
        to={{
          screen: "AccountSettings",
          params: { screen: "Devices" },
        }}
      >
        <SidebarIconLeft name="device-line" />
        <SidebarText>
          Devices {currentRouteName === "Devices" ? "(active)" : null}
        </SidebarText>
      </SidebarLink>
    </DrawerContentScrollView>
  );
}
