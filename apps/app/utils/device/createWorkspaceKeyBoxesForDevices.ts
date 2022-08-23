import { DeviceWorkspaceKeyBoxInput } from "../../generated/graphql";
import { Device } from "../../types/Device";
import { createWorkspaceKeyAndCipherTextForDevice } from "./createWorkspaceKeyAndCipherTextForDevice";
import { getActiveDevice } from "./getActiveDevice";
import { getMainDevice } from "./mainDeviceMemoryStore";

export type DeviceWorkspaceKeyBoxParams = {
  deviceSigningPublicKey: string;
  creatorDeviceSigningPublicKey: string;
  nonce: string;
  ciphertext: string;
};
export type Props = {
  workspaceId: string;
  devices: Device[];
};
export const createWorkspaceKeyBoxesForDevices = async ({
  workspaceId,
  devices,
}: Props) => {
  const deviceWorkspaceKeyBoxes: DeviceWorkspaceKeyBoxInput[] = [];
  const allDevices = devices;
  const mainDevice = getMainDevice();
  const activeDevice = await getActiveDevice();
  if (!activeDevice) {
    // TODO: handle this error
    throw new Error("No active device!");
  }
  if (!activeDevice.encryptionPrivateKey) {
    throw new Error("Active device doesn't have an encryptionPrivateKey!");
  }
  if (mainDevice) {
    allDevices.push(mainDevice);
  }
  let workspaceKeyString: string | undefined = undefined;
  for (const device of allDevices) {
    const { nonce, ciphertext, workspaceKey } =
      await createWorkspaceKeyAndCipherTextForDevice({
        receiverDeviceEncryptionPublicKey: device.encryptionPublicKey,
        creatorDeviceEncryptionPrivateKey: activeDevice.encryptionPrivateKey,
      });
    if (device.signingPublicKey === activeDevice.signingPublicKey) {
      workspaceKeyString = workspaceKey;
    }
    deviceWorkspaceKeyBoxes.push({
      ciphertext,
      nonce,
      deviceSigningPublicKey: device.signingPublicKey,
      creatorDeviceSigningPublicKey: activeDevice?.signingPublicKey!,
    });
  }
  return {
    deviceWorkspaceKeyBoxes,
    workspaceKey: workspaceKeyString,
  };
};
