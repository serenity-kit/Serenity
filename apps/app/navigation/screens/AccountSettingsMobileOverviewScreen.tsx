import { SidebarLink } from "@serenity-tools/ui";

export default function AccountSettingsMobileOverviewScreen() {
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
