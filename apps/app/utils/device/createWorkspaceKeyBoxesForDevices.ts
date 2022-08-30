import * as sodium from "@serenity-tools/libsodium";
import { DeviceWorkspaceKeyBoxInput } from "../../generated/graphql";
import { Device } from "../../types/Device";
import { createAndEncryptWorkspaceKeyForDevice } from "./createAndEncryptWorkspaceKeyForDevice";
import { getActiveDevice } from "./getActiveDevice";
import { getMainDevice } from "./mainDeviceMemoryStore";

export type DeviceWorkspaceKeyBoxParams = {
  deviceSigningPublicKey: string;
  creatorDeviceSigningPublicKey: string;
  nonce: string;
  ciphertext: string;
};
export type Props = {
  devices: Device[];
};
export const createWorkspaceKeyBoxesForDevices = async ({ devices }: Props) => {
  const deviceWorkspaceKeyBoxes: DeviceWorkspaceKeyBoxInput[] = [];
  const allDevices = devices;
  const mainDevice = getMainDevice();
  if (!mainDevice) {
    throw new Error("No main device found!");
  }
  const creatorDevice = await getActiveDevice();
  if (!creatorDevice) {
    // TODO: handle this error
    throw new Error("No active device!");
  }
  if (!creatorDevice.encryptionPrivateKey) {
    throw new Error("Active device doesn't have an encryptionPrivateKey!");
  }
  const activeDevice = await getActiveDevice();
  if (!activeDevice) {
    throw new Error("No active device found!");
  }
  const workspaceKey = await sodium.crypto_kdf_keygen();
  for (const receiverDevice of allDevices) {
    const { nonce, ciphertext } = await createAndEncryptWorkspaceKeyForDevice({
      receiverDeviceEncryptionPublicKey: receiverDevice.encryptionPublicKey,
      creatorDeviceEncryptionPrivateKey: creatorDevice.encryptionPrivateKey,
      workspaceKey,
    });
    deviceWorkspaceKeyBoxes.push({
      ciphertext,
      nonce,
      deviceSigningPublicKey: receiverDevice.signingPublicKey,
      creatorDeviceSigningPublicKey: creatorDevice?.signingPublicKey!,
    });
  }
  return {
    deviceWorkspaceKeyBoxes,
    workspaceKey: workspaceKey,
  };
};
