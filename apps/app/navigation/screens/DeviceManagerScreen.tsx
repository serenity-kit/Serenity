import { Link, Text, tw, View } from "@serenity-tools/ui";
import { FlatList } from "native-base";
import { useEffect, useState } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { useClient } from "urql";
import DeviceList from "../../components/device/DeviceList";
import DeviceListItem from "../../components/device/DeviceListItem";
import {
  DevicesDocument,
  DevicesQuery,
  DevicesQueryVariables,
  useDeleteDevicesMutation,
} from "../../generated/graphql";
import { Device } from "../../types/Device";

export default function DeviceManagerScreen(props) {
  useWindowDimensions();
  const urqlClient = useClient();
  const [, deleteDevicesMutation] = useDeleteDevicesMutation();
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    getDevices();
  }, []);

  const getDevices = async () => {
    const devicesResult = await urqlClient
      .query<DevicesQuery, DevicesQueryVariables>(
        DevicesDocument,
        {
          first: 50,
        },
        {
          // better to be safe here and always refetch
          requestPolicy: "network-only",
        }
      )
      .toPromise();
    const devices = devicesResult.data?.devices?.nodes as Device[];
    setDevices(devices);
  };

  const deleteDevice = async (deviceSigningPublicKey: string) => {
    // TODO: delete device and refresh device list
    const deleteDevicesResult = await deleteDevicesMutation({
      input: {
        signingPublicKeys: [deviceSigningPublicKey],
      },
    });
    if (deleteDevicesResult.data?.deleteDevices) {
      await getDevices();
    } else {
      // TODO: show error: couldn't delete folder
    }
  };

  return (
    <View style={tw`mt-20`}>
      <Text bold>Devices</Text>
      <DeviceList devices={devices} onDeletePress={deleteDevice} />
    </View>
  );
}

const styles = StyleSheet.create({
  listItem: {},
});
