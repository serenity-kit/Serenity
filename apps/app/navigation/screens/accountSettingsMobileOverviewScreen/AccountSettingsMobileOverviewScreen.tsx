import { SidebarLink, tw, View } from "@serenity-tools/ui";
import { useMachine } from "@xstate/react";
import { useWindowDimensions } from "react-native";
import { loadMeAndVerifyMachine } from "../../../machines/loadMeAndVerifyMachine";
import { RootStackScreenProps } from "../../../types/navigationProps";

export default function AccountSettingsMobileOverviewScreen(
  props: RootStackScreenProps<"AccountSettings">
) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  useMachine(loadMeAndVerifyMachine, {
    input: {
      navigation: props.navigation,
    },
  });

  return (
    <View style={tw`py-5`}>
      <SidebarLink
        to={{
          screen: "AccountSettingsProfile",
        }}
        iconName="user-line"
      >
        Profile
      </SidebarLink>
      <SidebarLink
        to={{
          screen: "AccountSettingsDevices",
        }}
        iconName="device-line"
      >
        Devices
      </SidebarLink>
    </View>
  );
}
