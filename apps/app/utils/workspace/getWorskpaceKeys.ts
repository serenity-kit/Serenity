import { Device } from "../../types/Device";
import { decryptWorkspaceKey } from "../device/decryptWorkspaceKey";
import { getWorkspace } from "./getWorkspace";

export type Props = {
  workspaceId: string;
  activeDevice: Device;
};
export const getWorkspaceKeys = async ({
  workspaceId,
  activeDevice,
}: Props): Promise<{ [workspaceKeyId: string]: string }> => {
  const workspace = await getWorkspace({
    deviceSigningPublicKey: activeDevice.signingPublicKey,
    workspaceId: workspaceId,
  });
  const workspaceKeys = workspace?.workspaceKeys;
  if (!workspaceKeys) {
    throw new Error("No workspaceKeys found for workspace");
  }
  const decryptedWorskpaceKeys: { [workspaceKeyId: string]: string } = {};
  for (let workspaceKey of workspaceKeys) {
    const workspaceKeyBox = workspaceKey.workspaceKeyBox;
    if (!workspaceKeyBox) {
      throw new Error("This device isn't registered for this workspace!");
    }
    const creatorDevice = workspaceKeyBox.creatorDevice;
    if (!creatorDevice) {
      // TODO: show this error in the UI
      throw new Error(
        `A creator device couldn't be retrieved for workspace ${workspaceId}!`
      );
    }
    const workspaceKeyString = await decryptWorkspaceKey({
      ciphertext: workspaceKeyBox.ciphertext,
      nonce: workspaceKeyBox.nonce,
      creatorDeviceEncryptionPublicKey: creatorDevice.encryptionPublicKey,
      receiverDeviceEncryptionPrivateKey: activeDevice.encryptionPrivateKey!,
    });
    decryptedWorskpaceKeys[workspaceKey.id] = workspaceKeyString;
  }
  return decryptedWorskpaceKeys;
};
