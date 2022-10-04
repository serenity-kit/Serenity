import { Text, tw, View } from "@serenity-tools/ui";
import { useMachine } from "@xstate/react";
import { FlatList, useWindowDimensions } from "react-native";
import { useClient } from "urql";
import DeviceListItem from "../../../components/deviceListItem/DeviceListItem";
import {
  useDeleteDevicesMutation,
  useDevicesQuery,
} from "../../../generated/graphql";
import { useWorkspaceContext } from "../../../hooks/useWorkspaceContext";
import { loadMeAndVerifyMachine } from "../../../machines/loadMeAndVerifyMachine";
import {
  WorkspaceDeviceParing,
  WorkspaceWithWorkspaceDevicesParing,
} from "../../../types/workspaceDevice";
import { createAndEncryptWorkspaceKeyForDevice } from "../../../utils/device/createAndEncryptWorkspaceKeyForDevice";
import { getWorkspaceDevices } from "../../../utils/workspace/getWorkspaceDevices";
import { getWorkspaceKey } from "../../../utils/workspace/getWorkspaceKey";
import { getWorkspaces } from "../../../utils/workspace/getWorkspaces";

// inspired by https://stackoverflow.com/a/46700791
function notNull<TypeValue>(value: TypeValue | null): value is TypeValue {
  return value !== null;
}

export default function DeviceManagerScreen(props) {
  useMachine(loadMeAndVerifyMachine, {
    context: {
      navigation: props.navigation,
    },
  });

  const { activeDevice } = useWorkspaceContext();
  useWindowDimensions();
  const urqlClient = useClient();

  const [devicesResult, fetchDevices] = useDevicesQuery({
    variables: {
      first: 500,
    },
  });
  const [, deleteDevicesMutation] = useDeleteDevicesMutation();

  const deleteDevice = async (deviceSigningPublicKey: string) => {
    const newDeviceWorkspaceKeyBoxes: WorkspaceWithWorkspaceDevicesParing[] =
      [];
    const workspaces = await getWorkspaces({
      urqlClient,
      deviceSigningPublicKey: activeDevice.signingPublicKey,
    });
    if (!workspaces) {
      console.error("no workspaces found for user");
      return;
    }
    for (let workspace of workspaces) {
      const workspaceId = workspace.id;
      const devices = await getWorkspaceDevices({
        urqlClient,
        workspaceId,
      });
      if (!devices) {
        console.error("No devices found");
        return;
      }
      const workspaceDevicePairing: WorkspaceDeviceParing[] = [];
      const workspaceKey = await getWorkspaceKey({
        workspaceId,
        urqlClient,
        activeDevice,
      });
      for (let device of devices) {
        if (!device) {
          continue;
        }
        if (device.signingPublicKey === deviceSigningPublicKey) {
          continue;
        }
        const { ciphertext, nonce } =
          await createAndEncryptWorkspaceKeyForDevice({
            receiverDeviceEncryptionPublicKey: device.encryptionPublicKey,
            creatorDeviceEncryptionPrivateKey:
              activeDevice.encryptionPrivateKey!,
            workspaceKey: workspaceKey.workspaceKey,
          });
        workspaceDevicePairing.push({
          ciphertext,
          nonce,
          receiverDeviceSigningPublicKey: device.signingPublicKey,
        });
      }
      newDeviceWorkspaceKeyBoxes.push({
        id: workspace.id,
        workspaceDevices: workspaceDevicePairing,
      });
    }
    const deleteDevicesResult = await deleteDevicesMutation({
      input: {
        creatorSigningPublicKey: activeDevice.signingPublicKey,
        newDeviceWorkspaceKeyBoxes,
        deviceSigningPublicKeysToBeDeleted: [deviceSigningPublicKey],
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
      <FlatList
        data={devicesResult.data?.devices?.nodes?.filter(notNull) || []}
        keyExtractor={(item) => item.signingPublicKey}
        renderItem={({ item }) => (
          <DeviceListItem
            isActiveDevice={
              activeDevice.signingPublicKey === item.signingPublicKey
            }
            signingPublicKey={item.signingPublicKey}
            encryptionPublicKey={item.encryptionPublicKey}
            encryptionPublicKeySignature={item.encryptionPublicKeySignature}
            createdAt={item.createdAt}
            info={item.info}
            onDeletePress={() => deleteDevice(item.signingPublicKey)}
          />
        )}
        ListEmptyComponent={() => (
          <View>
            <Text>No devices</Text>
          </View>
        )}
      />
    </View>
  );
}
