import * as sodium from "@serenity-tools/libsodium";
import { DeviceWorkspaceKeyBoxInput } from "../../generated/graphql";
import { Device } from "../../types/Device";
import { createAndEncryptWorkspaceKeyForDevice } from "./createAndEncryptWorkspaceKeyForDevice";
import { getMainDevice } from "./mainDeviceMemoryStore";

export type DeviceWorkspaceKeyBoxParams = {
  deviceSigningPublicKey: string;
  creatorDeviceSigningPublicKey: string;
  nonce: string;
  ciphertext: string;
};
export type Props = {
  devices: Device[];
  activeDevice: Device;
};
export const createWorkspaceKeyBoxesForDevices = async ({
  devices,
  activeDevice,
}: Props) => {
  const deviceWorkspaceKeyBoxes: DeviceWorkspaceKeyBoxInput[] = [];
  const allDevices = devices;
  const mainDevice = getMainDevice();
  if (!mainDevice) {
    throw new Error("No main device found!");
  }

  if (!activeDevice.encryptionPrivateKey) {
    throw new Error("Active device doesn't have an encryptionPrivateKey!");
  }

  const workspaceKey = await sodium.crypto_kdf_keygen();
  for (const receiverDevice of allDevices) {
    const { nonce, ciphertext } = await createAndEncryptWorkspaceKeyForDevice({
      receiverDeviceEncryptionPublicKey: receiverDevice.encryptionPublicKey,
      creatorDeviceEncryptionPrivateKey: activeDevice.encryptionPrivateKey,
      workspaceKey,
    });
    deviceWorkspaceKeyBoxes.push({
      ciphertext,
      nonce,
      deviceSigningPublicKey: receiverDevice.signingPublicKey,
    });
  }
  return {
    deviceWorkspaceKeyBoxes,
    workspaceKey: workspaceKey,
  };
};
