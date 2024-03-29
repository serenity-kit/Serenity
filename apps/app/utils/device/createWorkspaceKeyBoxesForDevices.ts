import {
  LocalDevice,
  VerifiedDevice,
  encryptWorkspaceKeyForDevice,
} from "@serenity-tools/common";
import sodium from "react-native-libsodium";
import { DeviceWorkspaceKeyBoxInput } from "../../generated/graphql";
import { getMainDevice } from "../../store/mainDeviceMemoryStore";

export type DeviceWorkspaceKeyBoxParams = {
  deviceSigningPublicKey: string;
  creatorDeviceSigningPublicKey: string;
  nonce: string;
  ciphertext: string;
};
export type Props = {
  devices: VerifiedDevice[];
  activeDevice: LocalDevice;
  workspaceKeyId: string;
  workspaceId: string;
};
export const createWorkspaceKeyBoxesForDevices = ({
  devices,
  activeDevice,
  workspaceId,
  workspaceKeyId,
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

  const workspaceKey = sodium.crypto_kdf_keygen();
  for (const receiverDevice of allDevices) {
    const { nonce, ciphertext } = encryptWorkspaceKeyForDevice({
      receiverDeviceEncryptionPublicKey: receiverDevice.encryptionPublicKey,
      creatorDeviceEncryptionPrivateKey: activeDevice.encryptionPrivateKey,
      workspaceKey: sodium.to_base64(workspaceKey),
      workspaceId,
      workspaceKeyId,
    });
    deviceWorkspaceKeyBoxes.push({
      ciphertext,
      nonce,
      deviceSigningPublicKey: receiverDevice.signingPublicKey,
    });
  }
  return {
    deviceWorkspaceKeyBoxes,
    workspaceKey: sodium.to_base64(workspaceKey),
  };
};
