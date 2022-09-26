import { SidebarLink } from "@serenity-tools/ui";
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
    <>
      <SidebarLink
        to={{
          screen: "WorkspaceSettingsGeneral",
          params: { workspaceId: props.route.params.workspaceId },
        }}
        iconName="settings-4-line"
      >
        General
      </SidebarLink>
      <SidebarLink
        to={{
          screen: "WorkspaceSettingsMembers",
          params: { workspaceId: props.route.params.workspaceId },
        }}
        iconName={"group-line"}
      >
        Members
      </SidebarLink>
    </>
  );
}
