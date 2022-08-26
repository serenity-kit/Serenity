import { Client } from "urql";
import { Device } from "../../types/Device";
import { decryptWorkspaceKey } from "../device/decryptWorkspaceKey";
import { getActiveDevice } from "../device/getActiveDevice";
import { getLocalDeviceBySigningPublicKey } from "../device/getLocalDeviceBySigningPublicKey";
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
  const workspaceKeyBox = workspace?.currentWorkspaceKey?.workspaceKeyBox;
  if (!workspaceKeyBox) {
    throw new Error("This device isn't registered for this workspace!");
  }
  const encryptingDevice = getLocalDeviceBySigningPublicKey({
    signingPublicKey: workspaceKeyBox.creatorDeviceSigningPublicKey,
    devices,
  });
  const workspaceKey = await decryptWorkspaceKey({
    ciphertext: workspaceKeyBox.ciphertext,
    nonce: workspaceKeyBox.nonce,
    creatorDeviceEncryptionPublicKey: encryptingDevice.encryptionPublicKey,
    receiverDeviceEncryptionPrivateKey: activeDevice.encryptionPrivateKey!,
  });
  return workspaceKey;
};
