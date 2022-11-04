import {
  Description,
  Heading,
  InfoMessage,
  SettingsContentWrapper,
  Text,
  View,
} from "@serenity-tools/ui";
import { useMachine } from "@xstate/react";
import { useState } from "react";
import { FlatList, useWindowDimensions } from "react-native";
import DeviceListItem from "../../../components/deviceListItem/DeviceListItem";
import { VerifyPasswordModal } from "../../../components/verifyPasswordModal/VerifyPasswordModal";
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
import { getMainDevice } from "../../../utils/device/mainDeviceMemoryStore";
import { deriveCurrentWorkspaceKey } from "../../../utils/workspace/deriveCurrentWorkspaceKey";
import { getWorkspaceDevices } from "../../../utils/workspace/getWorkspaceDevices";
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
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [signingPublicKeyToBeDeleted, setSigningPublicKeyToBeDeleted] =
    useState<string | undefined>(undefined);
  const { activeDevice } = useWorkspaceContext();
  useWindowDimensions();

  const [devicesResult, fetchDevices] = useDevicesQuery({
    variables: {
      hasNonExpiredSession: true,
      first: 500,
    },
  });
  const [, deleteDevicesMutation] = useDeleteDevicesMutation();

  const deleteDevicePreflight = async (deviceSigningPublicKey: string) => {
    const mainDevice = getMainDevice();
    if (!mainDevice) {
      setIsPasswordModalVisible(true);
      setSigningPublicKeyToBeDeleted(deviceSigningPublicKey);
      return;
    }
    await deleteDevice(deviceSigningPublicKey);
  };

  const deleteDevice = async (deviceSigningPublicKey: string) => {
    const newDeviceWorkspaceKeyBoxes: WorkspaceWithWorkspaceDevicesParing[] =
      [];
    const workspaces = await getWorkspaces({
      deviceSigningPublicKey: activeDevice.signingPublicKey,
    });
    if (!workspaces) {
      console.error("no workspaces found for user");
      setSigningPublicKeyToBeDeleted(undefined);
      return;
    }
    for (let workspace of workspaces) {
      const workspaceId = workspace.id;
      const devices = await getWorkspaceDevices({
        workspaceId,
      });
      if (!devices) {
        console.error("No devices found");
        setSigningPublicKeyToBeDeleted(undefined);
        return;
      }
      const workspaceDevicePairing: WorkspaceDeviceParing[] = [];
      const workspaceKey = await deriveCurrentWorkspaceKey({
        workspaceId,
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
    setSigningPublicKeyToBeDeleted(undefined);
  };

  return (
    <>
      <SettingsContentWrapper title={"Devices"}>
        <View>
          <Heading lvl={3} padded>
            Manage Devices
          </Heading>
          <Description variant={"form"}>
            The following list shows all the devices which are currently linked
            to your account.
          </Description>
        </View>
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
              expiresAt={item.mostRecentSession?.expiresAt}
              info={item.info}
              onDeletePress={() => deleteDevicePreflight(item.signingPublicKey)}
            />
          )}
          ListEmptyComponent={() => (
            <View>
              <Text>No devices</Text>
            </View>
          )}
        />
        <InfoMessage>
          Devices using the mobile application are always active, web devices on
          the other hand expire automatically after max 30 days after login,
          which means you will be asked for your password again after the given
          time period.
        </InfoMessage>
      </SettingsContentWrapper>
      <VerifyPasswordModal
        isVisible={isPasswordModalVisible}
        description="Creating a workspace invitation requires access to the main account and therefore verifying your password is required"
        onSuccess={() => {
          setIsPasswordModalVisible(false);
          if (signingPublicKeyToBeDeleted) {
            deleteDevice(signingPublicKeyToBeDeleted);
          }
        }}
        onCancel={() => {
          setSigningPublicKeyToBeDeleted(undefined);
          setIsPasswordModalVisible(false);
        }}
      />
    </>
  );
}
