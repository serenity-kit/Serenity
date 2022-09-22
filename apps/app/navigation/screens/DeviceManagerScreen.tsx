import { Text, tw, View } from "@serenity-tools/ui";
import { useWindowDimensions } from "react-native";
import { useClient } from "urql";
import DeviceList from "../../components/device/DeviceList";
import {
  useAuthorizeDevicesMutation,
  useDevicesQuery,
} from "../../generated/graphql";
import {
  WorkspaceDeviceParing,
  WorkspaceWithWorkspaceDevicesParing,
} from "../../types/workspaceDevice";
import { createAndEncryptWorkspaceKeyForDevice } from "../../utils/device/createAndEncryptWorkspaceKeyForDevice";
import { getActiveDevice } from "../../utils/device/getActiveDevice";
import { getWorkspaceKey } from "../../utils/workspace/getWorkspaceKey";
import { getWorkspaces } from "../../utils/workspace/getWorkspaces";

export default function DeviceManagerScreen(props) {
  useWindowDimensions();
  const urqlClient = useClient();

  const [devicesResult, fetchDevices] = useDevicesQuery({
    variables: {
      first: 500,
    },
  });
  const [, authorizeDevicesMutation] = useAuthorizeDevicesMutation();

  const deleteDevice = async (deviceSigningPublicKey: string) => {
    // TODO remove the device also from the storage
    const activeDevice = await getActiveDevice();
    if (!activeDevice) {
      // TOOD: show this in the UI
      console.error("No active device found");
      return;
    }
    const newDeviceWorkspaceKeyBoxes: WorkspaceWithWorkspaceDevicesParing[] =
      [];
    const devices = devicesResult.data?.devices?.nodes;
    if (!devices) {
      console.error("No devices found");
      return;
    }
    const workspaces = await getWorkspaces({
      urqlClient,
      deviceSigningPublicKey: activeDevice.signingPublicKey,
    });
    if (!workspaces) {
      console.error("no workspaces found for user");
      return;
    }
    for (let workspace of workspaces) {
      const workspaceDevicePairing: WorkspaceDeviceParing[] = [];
      const workspaceKey = await getWorkspaceKey({
        workspaceId: workspace.id,
        urqlClient,
      });
      for (let device of devices) {
        if (!device) {
          continue;
        }
        const { ciphertext, nonce } =
          await createAndEncryptWorkspaceKeyForDevice({
            receiverDeviceEncryptionPublicKey: device.encryptionPublicKey,
            creatorDeviceEncryptionPrivateKey:
              activeDevice.encryptionPrivateKey!,
            workspaceKey,
          });
        workspaceDevicePairing.push({
          ciphertext,
          nonce,
          receiverDeviceSigningPublicKey: device.encryptionPublicKey,
        });
      }
      newDeviceWorkspaceKeyBoxes.push({
        id: workspace.id,
        workspaceDevices: workspaceDevicePairing,
      });
    }
    const authorizeDevicesResult = await authorizeDevicesMutation({
      input: {
        creatorSigningPublicKey: activeDevice.signingPublicKey,
        newDeviceWorkspaceKeyBoxes,
      },
    });
    if (authorizeDevicesResult.data?.authorizeDevices) {
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
