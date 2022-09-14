import { SidebarLink } from "@serenity-tools/ui";

export default function WorkspaceSettingsMobileOverviewScreen(props) {
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
