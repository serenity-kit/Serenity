import { SidebarIconLeft, SidebarLink, SidebarText } from "@serenity-tools/ui";

export default function WorkspaceSettingsMobileOverviewScreen(props) {
  return (
    <>
      <SidebarLink
        to={{
          screen: "WorkspaceSettingsGeneral",
          params: { workspaceId: props.route.params.workspaceId },
        }}
        icon="settings-4-line"
      >
        General
      </SidebarLink>
      <SidebarLink
        to={{
          screen: "WorkspaceSettingsMembers",
          params: { workspaceId: props.route.params.workspaceId },
        }}
        icon={"group-line"}
      >
        Members
      </SidebarLink>
    </>
  );
}
