import { SidebarIconLeft, SidebarLink, SidebarText } from "@serenity-tools/ui";

export default function WorkspaceSettingsMobileOverviewScreen(props) {
  return (
    <>
      <SidebarLink
        to={{
          screen: "WorkspaceSettingsGeneral",
          params: { workspaceId: props.route.params.workspaceId },
        }}
      >
        <SidebarIconLeft name="settings-4-line" />
        <SidebarText>General</SidebarText>
      </SidebarLink>
      <SidebarLink
        to={{
          screen: "WorkspaceSettingsMembers",
          params: { workspaceId: props.route.params.workspaceId },
        }}
      >
        <SidebarIconLeft name="group-line" />
        <SidebarText>Members</SidebarText>
      </SidebarLink>
    </>
  );
}
