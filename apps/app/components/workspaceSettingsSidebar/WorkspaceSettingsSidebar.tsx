import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from "@react-navigation/drawer";

import { Heading, SidebarLink, tw } from "@serenity-tools/ui";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useGetLocalCurrentUser } from "../../store/userStore";

export default function WorkspaceSettingsSidebar(
  props: DrawerContentComponentProps
) {
  const currentRouteName = props.state.routeNames[props.state.index];
  const { workspaceId } = useWorkspace();
  const currentUser = useGetLocalCurrentUser();
  console.log({ currentUser });
  // const canEditWorkspace = useCanEditWorkspace({
  //   workspaceId,
  //   mainDeviceSigningPublicKey: currentUser?.mainDeviceSigningPublicKey,
  // });

  return (
    <DrawerContentScrollView {...props} style={tw`bg-gray-100 py-4`}>
      <Heading lvl={4} style={tw`px-4 pb-4`}>
        Workspace Settings
      </Heading>
      <SidebarLink
        to={{
          screen: "Workspace",
          params: {
            workspaceId,
            screen: "WorkspaceSettings",
            params: {
              screen: "General",
            },
          },
        }}
        iconName="settings-4-line"
        active={currentRouteName === "General"}
      >
        General
      </SidebarLink>
      <SidebarLink
        to={{
          screen: "Workspace",
          params: {
            workspaceId,
            screen: "WorkspaceSettings",
            params: {
              screen: "Members",
            },
          },
        }}
        iconName="group-line"
        active={currentRouteName === "Members"}
      >
        Members
      </SidebarLink>
    </DrawerContentScrollView>
  );
}
