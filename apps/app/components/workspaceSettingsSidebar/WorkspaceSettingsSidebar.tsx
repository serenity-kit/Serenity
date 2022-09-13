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
import { useWorkspaceId } from "../../context/WorkspaceIdContext";

export default function WorkspaceSettingsSidebar(
  props: DrawerContentComponentProps
) {
  const currentRouteName = props.state.routeNames[props.state.index];
  const workspaceId = useWorkspaceId();
  return (
    <DrawerContentScrollView {...props} style={tw`bg-gray-100 -mt-1 pb-4`}>
      <SidebarLink
        to={{
          screen: "WorkspaceSettings",
          params: { screen: "General", workspaceId },
        }}
      >
        <SidebarIconLeft name="settings-4-line" />
        <SidebarText>
          General {currentRouteName === "General" ? "(active)" : null}
        </SidebarText>
      </SidebarLink>
      <SidebarLink
        to={{
          screen: "WorkspaceSettings",
          params: { screen: "Members", workspaceId },
        }}
      >
        <SidebarIconLeft name="group-line" />
        <SidebarText variant="xs">
          Members {currentRouteName === "Members" ? "(active)" : null}
        </SidebarText>
      </SidebarLink>
    </DrawerContentScrollView>
  );
}
