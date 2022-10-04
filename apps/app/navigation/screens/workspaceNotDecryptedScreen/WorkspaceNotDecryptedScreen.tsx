import {
  CenterContent,
  InfoMessage,
  Spinner,
  Text,
  tw,
  View,
} from "@serenity-tools/ui";
import { useMachine } from "@xstate/react";
import { useWindowDimensions } from "react-native";
import { useWorkspaceId } from "../../../context/WorkspaceIdContext";
import { WorkspaceDrawerScreenProps } from "../../../types/navigation";
import { workspaceNotDecryptedScreenMachine } from "./workspaceNotDecryptedScreenMachine";

export default function WorkspaceNotDecryptedScreen({
  navigation,
  route,
}: WorkspaceDrawerScreenProps<"WorkspaceNotDecrypted">) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const workspaceId = useWorkspaceId();

  // TODO show error message in case there is network error
  // TODO communicate when the next check attempt is happening
  const [state] = useMachine(workspaceNotDecryptedScreenMachine, {
    context: {
      workspaceId,
      navigation,
    },
  });

  return (
    <CenterContent style={tw`px-4`}>
      <InfoMessage variant="info" style={tw`max-w-xs`}>
        You joined the workspace. In order to access the workspace content you
        need to wait for an existing workspace member to authorize you.
      </InfoMessage>
      <View style={tw`flex-row mt-8`}>
        <Spinner />
        <Text style={tw`pl-4`}>Waiting for authorization</Text>
      </View>
    </CenterContent>
  );
}
