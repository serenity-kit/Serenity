import * as userChain from "@serenity-kit/user-chain";
import {
  createAndEncryptWorkspaceKeyForDevice,
  getExpiredTextFromString,
} from "@serenity-tools/common";
import {
  Description,
  Heading,
  IconButton,
  InfoMessage,
  List,
  ListHeader,
  ListIconText,
  ListItem,
  ListText,
  SettingsContentWrapper,
  View,
  useIsDesktopDevice,
} from "@serenity-tools/ui";
import { useMachine } from "@xstate/react";
import { format } from "date-fns";
import { useState } from "react";
import { useWindowDimensions } from "react-native";
import sodium from "react-native-libsodium";
import { VerifyPasswordModal } from "../../../components/verifyPasswordModal/VerifyPasswordModal";
import {
  useDeleteDeviceMutation,
  useDevicesQuery,
  useUserChainQuery,
} from "../../../generated/graphql";
import { useAuthenticatedAppContext } from "../../../hooks/useAuthenticatedAppContext";
import { loadMeAndVerifyMachine } from "../../../machines/loadMeAndVerifyMachine";
import { RootStackScreenProps } from "../../../types/navigationProps";
import {
  WorkspaceDeviceParing,
  WorkspaceWithWorkspaceDevicesParing,
} from "../../../types/workspaceDevice";
import { getMainDevice } from "../../../utils/device/mainDeviceMemoryStore";
import { notNull } from "../../../utils/notNull/notNull";
import { getWorkspaceDevices } from "../../../utils/workspace/getWorkspaceDevices";
import { getWorkspaces } from "../../../utils/workspace/getWorkspaces";

export default function AccountDevicesSettingsScreen(
  props: RootStackScreenProps<"AccountSettingsDevices">
) {
  useMachine(loadMeAndVerifyMachine, {
    context: {
      navigation: props.navigation,
    },
  });
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [signingPublicKeyToBeDeleted, setSigningPublicKeyToBeDeleted] =
    useState<string | undefined>(undefined);
  const { activeDevice } = useAuthenticatedAppContext();
  useWindowDimensions();
  const isDesktopDevice = useIsDesktopDevice();

  // TODO remove it and use the userChainState
  const [devicesResult, fetchDevices] = useDevicesQuery({
    variables: {
      hasNonExpiredSession: true,
      first: 500,
    },
  });
  const [, deleteDeviceMutation] = useDeleteDeviceMutation();

  const [userChainQueryResult, reExecuteUserChainQuery] = useUserChainQuery({});

  let userChainState: userChain.UserChainState | null = null;
  let lastChainEvent: userChain.UserChainEvent | null = null;
  if (userChainQueryResult.data?.userChain?.nodes) {
    const userChainResult = userChain.resolveState({
      events: userChainQueryResult.data.userChain.nodes
        .filter(notNull)
        .map((event) => {
          const data = userChain.UserChainEvent.parse(
            JSON.parse(event.serializedContent)
          );
          lastChainEvent = data;
          return data;
        }),
      knownVersion: userChain.version,
    });
    userChainState = userChainResult.currentState;
  }

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
    const mainDevice = getMainDevice();
    if (!mainDevice) {
      throw new Error("Main device not available");
    }
    if (!lastChainEvent) {
      throw new Error("lastChainEvent not available");
    }
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
      const workspaceKeyString = sodium.to_base64(sodium.crypto_kdf_keygen());
      for (let device of devices) {
        if (!device) {
          continue;
        }
        if (device.signingPublicKey === deviceSigningPublicKey) {
          continue;
        }
        const { workspaceKey, ciphertext, nonce } =
          createAndEncryptWorkspaceKeyForDevice({
            receiverDeviceEncryptionPublicKey: device.encryptionPublicKey,
            creatorDeviceEncryptionPrivateKey:
              activeDevice.encryptionPrivateKey!,
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

    const event = userChain.removeDevice({
      authorKeyPair: {
        privateKey: mainDevice.signingPrivateKey,
        publicKey: mainDevice.signingPublicKey,
      },
      devicePublicKey: deviceSigningPublicKey,
      prevEvent: lastChainEvent,
    });

    const deleteDeviceResult = await deleteDeviceMutation({
      input: {
        creatorSigningPublicKey: activeDevice.signingPublicKey,
        newDeviceWorkspaceKeyBoxes,
        serializedUserChainEvent: JSON.stringify(event),
      },
    });
    if (deleteDeviceResult.data?.deleteDevice) {
      fetchDevices();
      reExecuteUserChainQuery();
    } else {
      // TODO: show error: couldn't delete device
    }
    setSigningPublicKeyToBeDeleted(undefined);
  };

  const devices = devicesResult.data?.devices?.nodes?.filter(notNull) || [];

  type AccountSettingsDevice = {
    signingPublicKey: string;
    deviceName: string;
    expiresAt?: string;
    createdAt?: string;
    type: string;
  };

  const activeDevices: AccountSettingsDevice[] = [];
  const expiredDevices: AccountSettingsDevice[] = [];
  if (devices.length > 0 && userChainState !== null) {
    Object.entries(userChainState.devices).forEach(
      ([signingPublicKey, { expiresAt }]) => {
        const device = devices.find(
          (deviceInfo) => deviceInfo.signingPublicKey === signingPublicKey
        );
        const deviceInfo = JSON.parse(device?.info || "{}");

        let deviceName = "";
        switch (deviceInfo.type) {
          case "web":
            deviceName = deviceInfo.browser;
            break;
          case "main":
            deviceName = "Main";
            break;
          default:
            deviceName = deviceInfo.os;
        }

        if (signingPublicKey === userChainState?.mainDeviceSigningPublicKey) {
          activeDevices.unshift({
            signingPublicKey,
            deviceName,
            expiresAt,
            createdAt: device?.createdAt,
            type: deviceInfo.type,
          });
        } else {
          if (
            expiresAt === undefined ||
            (expiresAt && new Date(expiresAt) > new Date())
          ) {
            activeDevices.push({
              signingPublicKey,
              deviceName,
              expiresAt,
              createdAt: device?.createdAt,
              type: deviceInfo.type,
            });
          } else {
            expiredDevices.push({
              signingPublicKey,
              deviceName,
              expiresAt,
              createdAt: device?.createdAt,
              type: deviceInfo.type,
            });
          }
        }
      }
    );
  }

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
        <List
          data={devices}
          emptyString={"No devices found."}
          header={
            <ListHeader
              data={["name", "created at", "expires"]}
              mainIsIconText
            />
          }
          testID={"devices-list"}
        >
          {activeDevices.map((device) => {
            const isMainDevice = device.type === "main";
            const isWebDevice = device.type === "web";
            const isActiveDevice =
              activeDevice.signingPublicKey === device.signingPublicKey;

            return (
              <ListItem
                key={device.signingPublicKey}
                mainItem={
                  <ListIconText
                    iconName={isWebDevice ? "window-line" : "device-line"}
                    main={
                      device.deviceName +
                      (isActiveDevice ? " (this device)" : "")
                    }
                    secondary={
                      device.createdAt &&
                      (!isDesktopDevice ? "Created at " : "") +
                        format(new Date(device.createdAt), "yyyy-MM-dd")
                    }
                  ></ListIconText>
                }
                secondaryItem={
                  <ListText secondary>
                    {device.expiresAt &&
                      getExpiredTextFromString(
                        device.expiresAt,
                        isDesktopDevice
                      )}
                  </ListText>
                }
                actionItem={
                  !isMainDevice && !isActiveDevice ? (
                    <IconButton
                      name={"delete-bin-line"}
                      color={isDesktopDevice ? "gray-900" : "gray-700"}
                      onPress={() =>
                        deleteDevicePreflight(device.signingPublicKey)
                      }
                    />
                  ) : null
                }
              ></ListItem>
            );
          })}
        </List>
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
