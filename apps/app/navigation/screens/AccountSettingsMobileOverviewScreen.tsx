import { Text, SidebarLink, Icon, View, tw } from "@serenity-tools/ui";

export default function AccountSettingsMobileOverviewScreen() {
  return (
    <>
      <SidebarLink
        to={{
          screen: "AccountSettingsProfile",
        }}
      >
        <Icon name="user-line" color={"gray-900"} />
        <Text>Profile</Text>
        <View style={tw`ml-auto`}>
          <Icon name="arrow-right-s-line" color={"gray-900"} />
        </View>
      </SidebarLink>
      <SidebarLink
        to={{
          screen: "AccountSettingsDevices",
        }}
      >
        <Icon name="device-line" color={"gray-900"} />
        <Text>Devices</Text>
        <View style={tw`ml-auto`}>
          <Icon name="arrow-right-s-line" color={"gray-900"} />
        </View>
      </SidebarLink>
    </>
  );
}
