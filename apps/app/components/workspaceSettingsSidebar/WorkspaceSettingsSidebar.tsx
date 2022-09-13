import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from "@react-navigation/drawer";

import { Icon, SidebarLink, Text, tw } from "@serenity-tools/ui";
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
        <Icon name="settings-4-line" color={"gray-800"} />
        <Text variant="xs">
          General {currentRouteName === "General" ? "(active)" : null}
        </Text>
      </SidebarLink>
      <SidebarLink
        to={{
          screen: "WorkspaceSettings",
          params: { screen: "Members", workspaceId },
        }}
      >
        <Icon name="group-line" color={"gray-800"} />
        <Text variant="xs">
          Members {currentRouteName === "Members" ? "(active)" : null}
        </Text>
      </SidebarLink>
    </DrawerContentScrollView>
  );
}
