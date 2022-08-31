import { Icon, SidebarLink, Text, tw } from "@serenity-tools/ui";

export default function WorkspaceSettingsMobileOverviewScreen(props) {
  return (
    <>
      <SidebarLink
        to={{
          screen: "WorkspaceSettingsGeneral",
          params: { workspaceId: props.route.params.workspaceId },
        }}
      >
        <Icon
          name="settings-4-line"
          size={4.5}
          mobileSize={5.5}
          color={tw.color("gray-800")}
        />
        <Text variant="sm"> General</Text>
      </SidebarLink>
      <SidebarLink
        to={{
          screen: "WorkspaceSettingsMembers",
          params: { workspaceId: props.route.params.workspaceId },
        }}
      >
        <Icon
          name="settings-4-line"
          size={4.5}
          mobileSize={5.5}
          color={tw.color("gray-800")}
        />
        <Text variant="sm">Members</Text>
      </SidebarLink>
    </>
  );
}
