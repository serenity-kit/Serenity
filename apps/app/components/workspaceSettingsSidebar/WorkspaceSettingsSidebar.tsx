import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from "@react-navigation/drawer";

import { SidebarLink, tw } from "@serenity-tools/ui";
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
        iconName="settings-4-line"
      >
        General {currentRouteName === "General" ? "(active)" : null}
      </SidebarLink>
      <SidebarLink
        to={{
          screen: "WorkspaceSettings",
          params: { screen: "Members", workspaceId },
        }}
        iconName="group-line"
      >
        Members {currentRouteName === "Members" ? "(active)" : null}
      </SidebarLink>
    </DrawerContentScrollView>
  );
}
