import { decryptWorkspaceKey, LocalDevice } from "@serenity-tools/common";
import { WorkspaceKeyBox } from "../../generated/graphql";
import { getWorkspace } from "./getWorkspace";

export type Props = {
  workspaceId: string;
  workspaceKeyId: string;
  activeDevice: LocalDevice;
};
export const retrieveWorkspaceKey = async ({
  workspaceId,
  workspaceKeyId,
  activeDevice,
}: Props) => {
  const workspace = await getWorkspace({
    deviceSigningPublicKey: activeDevice.signingPublicKey,
    workspaceId: workspaceId,
  });
  if (!workspace?.workspaceKeys) {
    throw new Error("No workspace keys found for this device.");
  }
  let workspaceKeyBox: WorkspaceKeyBox | undefined = undefined;
  for (let workspaceKey of workspace.workspaceKeys) {
    if (workspaceKey.id === workspaceKeyId && workspaceKey.workspaceKeyBox) {
      workspaceKeyBox = workspaceKey.workspaceKeyBox;
      break;
    }
  }
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
  // TODO verify that creator
  // needs a workspace key chain with a main device!
  const workspaceKey = decryptWorkspaceKey({
    ciphertext: workspaceKeyBox.ciphertext,
    nonce: workspaceKeyBox.nonce,
    creatorDeviceEncryptionPublicKey: creatorDevice.encryptionPublicKey,
    receiverDeviceEncryptionPrivateKey: activeDevice.encryptionPrivateKey!,
    workspaceId: workspace.id,
    workspaceKeyId: workspaceKeyId,
  });
  return {
    id: workspace?.currentWorkspaceKey?.id,
    workspaceKey,
  };
};
