import { SnapshotDeviceKeyBoxInput } from "../../generated/graphql";
import { Device } from "../../types/Device";
import { encryptKeyForDevice } from "../device/encryptKeyForDevice";
import { getWorkspaceDevices } from "../workspace/getWorkspaceDevices";

export type Props = {
  workspaceId: string;
  creatorDevice: Device;
  snapshotKey: string;
};
export const buildSnapshotDeviceKeyBoxes = async ({
  workspaceId,
  creatorDevice,
  snapshotKey,
}: Props) => {
  const workspaceDevices = await getWorkspaceDevices({
    workspaceId,
  });
  if (!workspaceDevices) {
    throw new Error("workspace devices not found");
  }
  const snapshotDeviceKeyBoxes: SnapshotDeviceKeyBoxInput[] = [];
  for (let device of workspaceDevices) {
    if (!device) {
      continue;
    }
    // TODO: generalize this function name because it can be used
    // for more than just a workspaceKey, as is being done here
    const { ciphertext, nonce } = await encryptKeyForDevice({
      receiverDeviceEncryptionPublicKey: device.encryptionPublicKey,
      creatorDeviceEncryptionPrivateKey: creatorDevice.encryptionPrivateKey!,
      key: snapshotKey,
    });
    snapshotDeviceKeyBoxes.push({
      ciphertext,
      nonce,
      deviceSigningPublicKey: device.signingPublicKey,
    });
  }
  return snapshotDeviceKeyBoxes;
};
