import { SidebarLink, SidebarIconLeft, SidebarText } from "@serenity-tools/ui";

export default function AccountSettingsMobileOverviewScreen() {
  return (
    <>
      <SidebarLink
        to={{
          screen: "AccountSettingsProfile",
        }}
      >
        <SidebarIconLeft name="user-line" />
        <SidebarText>Profile</SidebarText>
      </SidebarLink>
      <SidebarLink
        to={{
          screen: "AccountSettingsDevices",
        }}
      >
        <SidebarIconLeft name="device-line" />
        <SidebarText>Devices</SidebarText>
      </SidebarLink>
    </>
  );
}
