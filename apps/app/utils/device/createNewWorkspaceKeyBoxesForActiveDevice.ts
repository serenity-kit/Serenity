import { Client } from "urql";
import { WorkspaceKeyBox, WorkspaceKeyBoxData } from "../../generated/graphql";
import { Device } from "../../types/Device";
import { getWorkspace } from "../workspace/getWorkspace";
import { getWorkspaces } from "../workspace/getWorkspaces";
import { decryptWorkspaceKey } from "./decryptWorkspaceKey";
import { encryptWorkspaceKeyForDevice } from "./encryptWorkspaceKeyForDevice";
import { getActiveDevice } from "./getActiveDevice";
import { getDevices } from "./getDevices";
import { getLocalDeviceBySigningPublicKey } from "./getLocalDeviceBySigningPublicKey";
import { getMainDevice } from "./mainDeviceMemoryStore";

type GetWorkspaceKeyBoxByDeviceSigningPublicKeyProps = {
  workspaceKeyBoxes: WorkspaceKeyBox[];
  deviceSigningPublicKey: string;
};
const getWorkspaceKeyBoxByDeviceSigningPublicKey = ({
  workspaceKeyBoxes,
  deviceSigningPublicKey,
}: GetWorkspaceKeyBoxByDeviceSigningPublicKeyProps):
  | WorkspaceKeyBox
  | undefined => {
  for (const workspaceKeyBox of workspaceKeyBoxes) {
    if (workspaceKeyBox.deviceSigningPublicKey === deviceSigningPublicKey) {
      return workspaceKeyBox;
    }
  }
  return undefined;
};

export type Props = {
  urqlClient: Client;
};
export const createNewWorkspaceKeyBoxesForActiveDevice = async ({
  urqlClient,
}: Props) => {
  const devices = await getDevices({ urqlClient });
  if (!devices) {
    throw new Error("No devices found");
  }
  const mainDevice = getMainDevice();
  if (!mainDevice) {
    throw new Error("No main device found!");
  }
  const activeDevice = await getActiveDevice();
  if (!activeDevice) {
    // TODO: handle this error
    throw new Error("No active device!");
  }
  const workspaces = await getWorkspaces({
    urqlClient,
    deviceSigningPublicKey: activeDevice.signingPublicKey!,
  });
  if (workspaces === null) {
    throw new Error("No workspaces found");
  }
  const deviceWorkspaceKeyBoxes: WorkspaceKeyBoxData[] = [];
  for (const workspace of workspaces) {
    const workspaceWithMainWorkspaceKeyBox = await getWorkspace({
      workspaceId: workspace.id,
      deviceSigningPublicKey: mainDevice?.signingPublicKey,
      urqlClient,
    });
    const workspaceKeyBox =
      workspaceWithMainWorkspaceKeyBox?.currentWorkspaceKey?.workspaceKeyBox;
    if (!workspaceKeyBox) {
      throw new Error("Could not find workspaceKeyBox for main device!");
    }
    let creatorDevice: Device | undefined = undefined;
    try {
      creatorDevice = getLocalDeviceBySigningPublicKey({
        signingPublicKey: workspaceKeyBox.creatorDeviceSigningPublicKey,
        devices,
      });
    } catch (error) {
      // Do nothing. We don't have access to this workspacekey yet
      continue;
    }
    const workspaceKey = await decryptWorkspaceKey({
      ciphertext: workspaceKeyBox.ciphertext,
      nonce: workspaceKeyBox.nonce,
      receiverDeviceEncryptionPrivateKey: mainDevice?.encryptionPrivateKey!,
      creatorDeviceEncryptionPublicKey: creatorDevice?.encryptionPublicKey!,
    });
    const { nonce, ciphertext } = await encryptWorkspaceKeyForDevice({
      workspaceKey,
      receiverDeviceEncryptionPublicKey: activeDevice.encryptionPublicKey,
      creatorDeviceEncryptionPrivateKey: mainDevice?.encryptionPrivateKey!,
    });
    deviceWorkspaceKeyBoxes.push({
      ciphertext,
      nonce,
      workspaceId: workspace.id,
    });
  }
  return {
    deviceWorkspaceKeyBoxes,
    creatorDevice: mainDevice,
    receiverDevice: activeDevice,
  };
};
