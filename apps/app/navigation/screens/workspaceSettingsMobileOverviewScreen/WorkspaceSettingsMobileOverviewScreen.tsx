import { SidebarLink, tw, View } from "@serenity-tools/ui";
import { useMachine } from "@xstate/react";
import { workspaceSettingsAccessMachine } from "../../../machines/workspaceSettingsAccessMachine";

export default function WorkspaceSettingsMobileOverviewScreen(props) {
  useMachine(workspaceSettingsAccessMachine, {
    context: {
      workspaceId: props.route.params.workspaceId,
      navigation: props.navigation,
    },
  });

  return (
    <View style={tw`py-5`}>
      <SidebarLink
        to={{
          screen: "Workspace2",
          params: {
            workspaceId: props.route.params.workspaceId,
            screen: "WorkspaceSettingsGeneral",
          },
        }}
        iconName="settings-4-line"
      >
        General
      </SidebarLink>
      <SidebarLink
        to={{
          screen: "Workspace2",
          params: {
            workspaceId: props.route.params.workspaceId,
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
