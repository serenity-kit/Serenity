import { Icon, SidebarLink, Text, tw, View } from "@serenity-tools/ui";

export default function WorkspaceSettingsMobileOverviewScreen(props) {
  return (
    <>
      <SidebarLink
        to={{
          screen: "WorkspaceSettingsGeneral",
          params: { workspaceId: props.route.params.workspaceId },
        }}
      >
        <Icon name="settings-4-line" color={"gray-900"} />
        <Text>General</Text>
        <View style={tw`ml-auto`}>
          <Icon name="arrow-right-s-line" color={"gray-900"} />
        </View>
      </SidebarLink>
      <SidebarLink
        to={{
          screen: "WorkspaceSettingsMembers",
          params: { workspaceId: props.route.params.workspaceId },
        }}
      >
        <Icon name="group-line" color={"gray-900"} />
        <Text>Members</Text>
        <View style={tw`ml-auto`}>
          <Icon name="arrow-right-s-line" color={"gray-900"} />
        </View>
      </SidebarLink>
    </>
  );
}
