import { Text, SidebarLink } from "@serenity-tools/ui";

export default function AccountSettingsMobileOverviewScreen() {
  return (
    <>
      <SidebarLink
        to={{
          screen: "AccountSettingsProfile",
        }}
      >
        <Text>Profile</Text>
      </SidebarLink>
      <SidebarLink
        to={{
          screen: "AccountSettingsDevices",
        }}
      >
        <Text>Devices</Text>
      </SidebarLink>
    </>
  );
}
