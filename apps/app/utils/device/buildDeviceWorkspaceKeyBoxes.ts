import { WorkspaceKeyBoxData } from "../../generated/graphql";
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
  workspaceId?: string;
  devices: Device[];
};
export const buildDeviceWorkspaceKeyBoxes = async ({
  workspaceId,
  devices,
}: Props) => {
  const newWorkspaceDeviceWorkspaceKeyBoxes: DeviceWorkspaceKeyBoxParams[] = [];
  const existingWorkspaceDeviceWorkspaceKeyBoxes: WorkspaceKeyBoxData[] = [];
  const allDevices = devices;
  const mainDevice = getMainDevice();
  const activeDevice = await getActiveDevice();
  if (!activeDevice) {
    // TODO: handle this error
    console.error("No active device!");
  }
  if (mainDevice) {
    allDevices.push(mainDevice);
  }
  let workspaceKeyString: string = "";
  for await (const device of allDevices) {
    const { nonce, ciphertext, workspaceKey } =
      await createWorkspaceKeyAndCipherTextForDevice({
        receiverDeviceEncryptionPublicKey: device.encryptionPublicKey,
        creatorDeviceEncryptionPrivateKey: activeDevice?.encryptionPrivateKey!,
      });
    if (workspaceKeyString === "") {
      workspaceKeyString = workspaceKey;
    }
    newWorkspaceDeviceWorkspaceKeyBoxes.push({
      deviceSigningPublicKey: device.signingPublicKey,
      creatorDeviceSigningPublicKey: activeDevice?.signingPublicKey!,
      nonce,
      ciphertext,
    });
    if (workspaceId) {
      existingWorkspaceDeviceWorkspaceKeyBoxes.push({
        ciphertext,
        nonce,
        workspaceId,
      });
    }
  }
  return {
    existingWorkspaceDeviceWorkspaceKeyBoxes,
    newWorkspaceDeviceWorkspaceKeyBoxes,
    workspaceKey: workspaceKeyString,
  };
};
