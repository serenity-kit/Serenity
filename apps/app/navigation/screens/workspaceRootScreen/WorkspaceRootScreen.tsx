import { CenterContent, Spinner, Text } from "@serenity-tools/ui";
import { useMachine } from "@xstate/react";
import { useWindowDimensions } from "react-native";
import { useWorkspace } from "../../../context/WorkspaceContext";
import { WorkspaceDrawerScreenProps } from "../../../types/navigationProps";
import { workspaceRootScreenMachine } from "./workspaceRootScreenMachine";

export default function WorkspaceRootScreen(
  props: WorkspaceDrawerScreenProps<"WorkspaceRoot">
) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const { workspaceId } = useWorkspace();

  const [state] = useMachine(workspaceRootScreenMachine, {
    input: {
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
