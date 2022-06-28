import { Text, tw, View } from "@serenity-tools/ui";
import { StyleSheet, useWindowDimensions } from "react-native";
import DeviceList from "../../components/device/DeviceList";
import { useDevicesQuery } from "../../generated/graphql";
import { Device } from "../../types/Device";

export default function DeviceManagerScreen(props) {
  useWindowDimensions();

  const [devicesResult] = useDevicesQuery({
    variables: {
      first: 50,
    },
  });

  const onDeviceDeleted = async (device: Device) => {
    // TODO: delete device and refresh device list
  };

  return (
    <View style={tw`mt-20`}>
      <Text bold>Devices</Text>
      {devicesResult.data?.devices?.nodes ? (
        <DeviceList
          devices={devicesResult.data?.devices?.nodes as Device[]}
          onDeviceDeleted={onDeviceDeleted}
        />
      ) : (
        <View style={styles.listItem}>
          <Text>No devices</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  listItem: {},
});
