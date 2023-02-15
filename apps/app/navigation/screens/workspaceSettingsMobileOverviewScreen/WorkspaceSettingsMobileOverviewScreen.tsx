import { SidebarLink, tw, View } from "@serenity-tools/ui";
import { useMachine } from "@xstate/react";
import { useWorkspace } from "../../../context/WorkspaceContext";
import { workspaceSettingsAccessMachine } from "../../../machines/workspaceSettingsAccessMachine";
import { WorkspaceStackScreenProps } from "../../../types/navigationProps";

export default function WorkspaceSettingsMobileOverviewScreen(
  props: WorkspaceStackScreenProps<"WorkspaceSettings">
) {
  const { workspaceId } = useWorkspace();
  useMachine(workspaceSettingsAccessMachine, {
    context: {
      workspaceId,
      navigation: props.navigation,
    },
    services: {
      loadInitialDataMachine: undefined,
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
