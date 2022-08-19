import { Client } from "urql";
import { WorkspaceKeyBoxData } from "../../generated/graphql";
import { getWorkspaces } from "../workspace/getWorkspaces";
import { createWorkspaceKeyAndCipherTextForDevice } from "./createWorkspaceKeyAndCipherTextForDevice";
import { getActiveDevice } from "./getActiveDevice";
import { getMainDevice } from "./mainDeviceMemoryStore";

export type Props = {
  urqlClient: Client;
};
export const createNewWorkspaceKeyBoxesForActiveDevice = async ({
  urqlClient,
}: Props) => {
  const mainDevice = getMainDevice();
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
    const { nonce, ciphertext } =
      await createWorkspaceKeyAndCipherTextForDevice({
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
