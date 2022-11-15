import { SettingsContentWrapper, Text } from "@serenity-tools/ui";
import { useMachine } from "@xstate/react";
import { useWindowDimensions } from "react-native";
import { loadMeAndVerifyMachine } from "../../../machines/loadMeAndVerifyMachine";
import { RootStackScreenProps } from "../../../types/navigationProps";

export default function AccountProfileSettingsScreen(
  props: RootStackScreenProps<"AccountSettingsProfile">
) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  useMachine(loadMeAndVerifyMachine, {
    context: {
      navigation: props.navigation,
    },
  });

  return (
    <SettingsContentWrapper title={"Profile"}>
      <Text>Profile Settings</Text>
    </SettingsContentWrapper>
  );
}
