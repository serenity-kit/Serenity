import { CenterContent, Spinner, Text } from "@serenity-tools/ui";
import { useMachine } from "@xstate/react";
import { useWindowDimensions } from "react-native";
import { useWorkspaceId } from "../../../context/WorkspaceIdContext";
import { WorkspaceRouteProps } from "../../../types/navigation";
import { workspaceRootScreenMachine } from "./workspaceRootScreenMachine";

export default function WorkspaceRootScreen(
  props: WorkspaceRouteProps<"WorkspaceRoot">
) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const workspaceId = useWorkspaceId();

  const [state] = useMachine(workspaceRootScreenMachine, {
    context: {
      workspaceId,
      navigation: props.navigation,
    },
  });

  if (state.matches("noDocumentsAvailable")) {
    return (
      <CenterContent>
        <Text>
          This workspace has no documents or you don't have access to any of
          them.
        </Text>
      </CenterContent>
    );
  }

  return (
    <CenterContent>
      <Spinner fadeIn size="lg" />
    </CenterContent>
  );
}
