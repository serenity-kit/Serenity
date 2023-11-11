import {
  decryptWorkspaceKey,
  encryptWorkspaceKeyForDevice,
  LocalDevice,
} from "@serenity-tools/common";
import {
  WorkspaceKeyBoxData,
  WorkspaceKeyDevicePair,
} from "../../generated/graphql";
import { getMainDevice } from "../../store/mainDeviceMemoryStore";
import { getWorkspace } from "../workspace/getWorkspace";
import { getWorkspaces } from "../workspace/getWorkspaces";
import { getDevices } from "./getDevices";

export type Props = {
  activeDevice: LocalDevice;
};
export const createNewWorkspaceKeyBoxesForActiveDevice = async ({
  activeDevice,
}: Props) => {
  const devices = await getDevices({ onlyNotExpired: true });
  if (!devices) {
    throw new Error("No devices found");
  }
  const mainDevice = getMainDevice();
  if (!mainDevice) {
    throw new Error("No main device found!");
  }
  const workspaces = await getWorkspaces({
    deviceSigningPublicKey: activeDevice.signingPublicKey,
  });
  if (workspaces === null) {
    throw new Error("No workspaces found");
  }
  const deviceWorkspaceKeyBoxes: WorkspaceKeyBoxData[] = [];
  for (const workspace of workspaces) {
    const workspaceWithMainWorkspaceKeyBox = await getWorkspace({
      workspaceId: workspace.id,
      deviceSigningPublicKey: mainDevice?.signingPublicKey,
    });
    const workspaceKeys = workspaceWithMainWorkspaceKeyBox?.workspaceKeys;
    if (!workspaceKeys) {
      // TODO: handle this error
      throw new Error("No workspace keys found for workspace");
    }
    const workspaceKeyDevicePairs: WorkspaceKeyDevicePair[] = [];
    for (let workspaceKey of workspaceKeys) {
      const workspaceKeyBox =
        workspaceWithMainWorkspaceKeyBox?.currentWorkspaceKey?.workspaceKeyBox;
      if (!workspaceKeyBox) {
        throw new Error("Could not find workspaceKeyBox for main device!");
      }
      const creatorDevice = workspaceKeyBox.creatorDevice;
      // TODO verify that creator
      // needs a workspace key chain with a main device!
      const workspaceKeyString = decryptWorkspaceKey({
        ciphertext: workspaceKeyBox.ciphertext,
        nonce: workspaceKeyBox.nonce,
        receiverDeviceEncryptionPrivateKey: mainDevice?.encryptionPrivateKey!,
        creatorDeviceEncryptionPublicKey: creatorDevice?.encryptionPublicKey!,
        workspaceId: workspace.id,
        workspaceKeyId: workspaceKey.id,
      });
      const { nonce, ciphertext } = encryptWorkspaceKeyForDevice({
        workspaceKey: workspaceKeyString,
        receiverDeviceEncryptionPublicKey: activeDevice.encryptionPublicKey,
        creatorDeviceEncryptionPrivateKey: mainDevice.encryptionPrivateKey!,
        workspaceId: workspace.id,
        workspaceKeyId: workspaceKey.id,
      });
      workspaceKeyDevicePairs.push({
        workspaceKeyId: workspaceKey.id,
        ciphertext,
        nonce,
      });
    }
    deviceWorkspaceKeyBoxes.push({
      workspaceId: workspace.id,
      workspaceKeyDevicePairs,
    });
  }
  return {
    deviceWorkspaceKeyBoxes,
    creatorDevice: mainDevice,
    receiverDevice: activeDevice,
  };
};
