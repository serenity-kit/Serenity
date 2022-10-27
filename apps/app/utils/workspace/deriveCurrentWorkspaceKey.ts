import { Device } from "../../types/Device";
import { decryptWorkspaceKey } from "../device/decryptWorkspaceKey";
import { getWorkspace } from "./getWorkspace";

export type Props = {
  workspaceId: string;
  activeDevice: Device;
};
export const deriveCurrentWorkspaceKey = async ({
  workspaceId,
  activeDevice,
}: Props) => {
  const workspace = await getWorkspace({
    deviceSigningPublicKey: activeDevice.signingPublicKey,
    workspaceId: workspaceId,
  });
  if (!workspace?.currentWorkspaceKey?.id) {
    throw new Error(
      "The currentWorkspaceKey has no ID. This should never happen."
    );
  }
  const workspaceKeyBox = workspace?.currentWorkspaceKey?.workspaceKeyBox;
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
  const workspaceKey = await decryptWorkspaceKey({
    ciphertext: workspaceKeyBox.ciphertext,
    nonce: workspaceKeyBox.nonce,
    creatorDeviceEncryptionPublicKey: creatorDevice.encryptionPublicKey,
    receiverDeviceEncryptionPrivateKey: activeDevice.encryptionPrivateKey!,
  });
  return {
    id: workspace?.currentWorkspaceKey?.id,
    workspaceKey,
  };
};
