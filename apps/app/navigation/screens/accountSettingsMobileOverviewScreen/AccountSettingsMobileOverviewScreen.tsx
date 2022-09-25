import { SidebarLink } from "@serenity-tools/ui";
import { useMachine } from "@xstate/react";
import { useWindowDimensions } from "react-native";
import { loadMeAndVerifyMachine } from "../../../machines/loadMeAndVerifyMachine";

export default function AccountSettingsMobileOverviewScreen(props) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  useMachine(loadMeAndVerifyMachine, {
    context: {
      navigation: props.navigation,
    },
  });

  return (
    <>
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
    </>
  );
}
