import { SidebarLink, tw, View } from "@serenity-tools/ui";
import { useMachine } from "@xstate/react";
import { useWorkspaceId } from "../../../context/WorkspaceIdContext";
import { workspaceSettingsAccessMachine } from "../../../machines/workspaceSettingsAccessMachine";

export default function WorkspaceSettingsMobileOverviewScreen(props) {
  const workspaceId = useWorkspaceId();
  useMachine(workspaceSettingsAccessMachine, {
    context: {
      workspaceId,
      navigation: props.navigation,
    },
  });

  return (
    <View style={tw`py-5`}>
      <SidebarLink
        to={{
          screen: "Workspace",
          params: {
            workspaceId,
            screen: "WorkspaceSettingsGeneral",
          },
        }}
        iconName="settings-4-line"
      >
        General
      </SidebarLink>
      <SidebarLink
        to={{
          screen: "Workspace",
          params: {
            workspaceId,
            screen: "WorkspaceSettingsMembers",
          },
        }}
        iconName={"group-line"}
      >
        Members
      </SidebarLink>
    </View>
  );
}
