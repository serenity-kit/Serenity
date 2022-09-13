import { SidebarLink, SidebarIconLeft, SidebarText } from "@serenity-tools/ui";

export default function AccountSettingsMobileOverviewScreen() {
  return (
    <>
      <SidebarLink
        to={{
          screen: "AccountSettingsProfile",
        }}
        icon="user-line"
      >
        Profile
      </SidebarLink>
      <SidebarLink
        to={{
          screen: "AccountSettingsDevices",
        }}
        icon="device-line"
      >
        Devices
      </SidebarLink>
    </>
  );
}
