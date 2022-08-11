import { Client } from "urql";
import {
  AttachDeviceToWorkspaceDocument,
  AttachDeviceToWorkspaceMutation,
  AttachDeviceToWorkspaceMutationVariables,
  DevicesDocument,
  DevicesQuery,
  DevicesQueryVariables,
} from "../../generated/graphql";
import { Device } from "../../types/Device";
import { fetchMainDevice } from "../authentication/loginHelper";
import { getWorkspace } from "../workspace/getWorkspace";
import { createWorkspaceKeyAndCipherTextForDevice } from "./createWorkspaceKeyAndCipherTextForDevice";
import { decryptWorkspaceKey } from "./decryptWorkspaceKey";
import { getActiveDevice } from "./getActiveDevice";
import { getDeviceBySigningPublicKey } from "./getDeviceBySigningPublicKey";
import { getMainDevice } from "./mainDeviceMemoryStore";

export type Props = {
  exportKey: string;
  device: Device;
  workspaceId: string;
  urqlClient: Client;
};

export const attachActiveDeviceToWorkspace = async ({
  exportKey,
  device,
  workspaceId,
  urqlClient,
}: Props) => {
  // TODO: move mainDevice test and fetch to a "login required" utility
  const testMainDevice = getMainDevice();
  if (!testMainDevice) {
    await fetchMainDevice({
      urqlClient,
      exportKey,
    });
  }
  const mainDevice = getMainDevice();
  if (!mainDevice) {
    throw new Error("No mainDevice found!");
  }
  const workspace = await getWorkspace({
    workspaceId,
    deviceSigningPublicKey: mainDevice.signingPublicKey,
    urqlClient,
  });
  if (!workspace?.currentWorkspaceKey?.workspaceKeyBox) {
    throw new Error("No workspaceKeyBox found for mainDevice!");
  }
  const workspaceKeyBox = workspace?.currentWorkspaceKey?.workspaceKeyBox;
  if (!mainDevice.encryptionPrivateKey) {
    throw new Error("mainDevice doesn't have an encryption private key!");
  }
  const devicesResult = await urqlClient
    .query<DevicesQuery, DevicesQueryVariables>(
      DevicesDocument,
      { first: 500 },
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
      }
    )
    .toPromise();
  if (devicesResult.error) {
    throw new Error(devicesResult.error.message);
  }
  if (!devicesResult.data?.devices?.nodes) {
    throw new Error("No devices found for user");
  }
  const rawDevices = devicesResult.data?.devices?.nodes;
  const devices: Device[] = [];
  rawDevices.forEach((device) => {
    if (device) {
      devices.push(device);
    }
  });
  devices.push(mainDevice);
  const creatorDevice = getDeviceBySigningPublicKey({
    signingPublicKey: workspaceKeyBox.creatorDeviceSigningPublicKey,
    devices,
  });
  if (!creatorDevice) {
    throw new Error("Could not find the worskpaceKeyBox's creating device");
  }
  const activeDevice = await getActiveDevice();
  if (!activeDevice) {
    throw new Error("no active device!");
  }
  if (!activeDevice.encryptionPrivateKey) {
    throw new Error("Active device doesn't have an encryption private key");
  }
  const workspaceKey = await decryptWorkspaceKey({
    creatorDeviceEncryptionPublicKey: creatorDevice.encryptionPublicKey,
    receiverDeviceEncryptionPrivateKey: mainDevice.encryptionPrivateKey,
    nonce: workspaceKeyBox.nonce,
    ciphertext: workspaceKeyBox.ciphertext,
  });
  const { nonce, ciphertext } = await createWorkspaceKeyAndCipherTextForDevice({
    receiverDeviceEncryptionPublicKey: device.encryptionPublicKey!,
    creatorDeviceEncryptionPrivateKey: activeDevice?.encryptionPrivateKey!,
    workspaceKey,
  });
  await urqlClient
    .mutation<
      AttachDeviceToWorkspaceMutation,
      AttachDeviceToWorkspaceMutationVariables
    >(
      AttachDeviceToWorkspaceDocument,
      {
        input: {
          workspaceId,
          receiverDeviceSigningPublicKey: device.signingPublicKey,
          creatorDeviceSigningPublicKey: device.signingPublicKey,
          nonce,
          ciphertext,
        },
      },
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
      }
    )
    .toPromise();
};
