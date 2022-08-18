import { Client } from "urql";
import { Device } from "../../types/Device";
import { decryptWorkspaceKey } from "../device/decryptWorkspaceKey";
import { getActiveDevice } from "../device/getActiveDevice";
import { getDeviceBySigningPublicKey } from "../device/getDeviceBySigningPublicKey";
import { getMainDevice } from "../device/mainDeviceMemoryStore";
import { getWorkspace } from "./getWorkspace";

export type Props = {
  workspaceId: string;
  devices: Device[];
  urqlClient: Client;
};
export const getWorkspaceKey = async ({
  workspaceId,
  devices,
  urqlClient,
}: Props) => {
  const activeDevice = await getActiveDevice();
  if (!activeDevice) {
    throw new Error("No active device!");
  }
  const workspace = await getWorkspace({
    urqlClient,
    deviceSigningPublicKey: activeDevice.signingPublicKey,
    workspaceId: workspaceId,
  });
  console.log({ workspace });
  const workspaceKeyBox = workspace?.currentWorkspaceKey?.workspaceKeyBox;
  if (!workspaceKeyBox) {
    throw new Error("This device isn't registered for this workspace!");
  }
  const mainDevice = getMainDevice();
  const userDevices = devices;
  if (!userDevices) {
    throw new Error("No devices found!");
  }
  const allDevices: Device[] = [];
  userDevices.forEach((device) => {
    if (device) {
      devices.push(device);
    }
  });
  if (mainDevice) {
    allDevices.push(mainDevice);
  }
  const encryptingDevice = getDeviceBySigningPublicKey({
    signingPublicKey: workspaceKeyBox.creatorDeviceSigningPublicKey,
    devices: allDevices,
  });
  const workspaceKey = await decryptWorkspaceKey({
    ciphertext: workspaceKeyBox?.ciphertext,
    nonce: workspaceKeyBox.nonce,
    creatorDeviceEncryptionPublicKey: encryptingDevice?.encryptionPublicKey!,
    receiverDeviceEncryptionPrivateKey: activeDevice.encryptionPrivateKey!,
  });
  return workspaceKey;
};
