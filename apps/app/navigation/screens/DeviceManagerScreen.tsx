import { Text, tw, View } from "@serenity-tools/ui";
import { useWindowDimensions } from "react-native";
import DeviceList from "../../components/device/DeviceList";
import {
  useDeleteDevicesMutation,
  useDevicesQuery,
} from "../../generated/graphql";

export default function DeviceManagerScreen(props) {
  useWindowDimensions();

  const [devicesResult, fetchDevices] = useDevicesQuery({
    variables: {
      first: 50,
    },
  });
  const [, deleteDevicesMutation] = useDeleteDevicesMutation();

  const deleteDevice = async (deviceSigningPublicKey: string) => {
    // TODO remove the device also from the storage
    const deleteDevicesResult = await deleteDevicesMutation({
      input: {
        signingPublicKeys: [deviceSigningPublicKey],
      },
    });
    if (deleteDevicesResult.data?.deleteDevices) {
      fetchDevices();
    } else {
      // TODO: show error: couldn't delete device
    }
  };

  return (
    <View style={tw`mt-20`}>
      <Text bold>Devices</Text>
      <DeviceList
        // @ts-expect-error filter out null values
        devices={
          devicesResult.data?.devices?.nodes?.filter(
            (device) => device !== null
          ) || []
        }
        onDeletePress={deleteDevice}
      />
    </View>
  );
}
