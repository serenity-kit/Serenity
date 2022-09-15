import { Client } from "urql";
import {
  MemberDevices,
  WorkspaceMemberDevices,
} from "../../types/workspaceDevice";
import { createAndEncryptWorkspaceKeyForDevice } from "../device/createAndEncryptWorkspaceKeyForDevice";
import { getActiveDevice } from "../device/getActiveDevice";
import { getDevices } from "../device/getDevices";
import { getWorkspaceKey } from "../workspace/getWorkspaceKey";

export type Props = {
  unauthorizedWorkspaceDevices: any;
  urqlClient: Client;
};
export const createWorkspaceMemberDevices = async ({
  unauthorizedWorkspaceDevices,
  urqlClient,
}: Props) => {
  const activeDevice = await getActiveDevice();
  if (!activeDevice) {
    // TODO: deal with these errors in the UI
    throw new Error("No active device found!");
  }
  const devices = await getDevices({ urqlClient });
  if (!devices) {
    // TODO: deal with these errors in the UI
    throw new Error("No devices found!");
  }
  const workspaceMemberDevices: WorkspaceMemberDevices[] = [];
  for (let unauthorizedWorkspace of unauthorizedWorkspaceDevices) {
    const workspaceKey = await getWorkspaceKey({
      workspaceId: unauthorizedWorkspace.id,
      devices,
      urqlClient,
    });
    const workspace: WorkspaceMemberDevices = {
      id: unauthorizedWorkspace.id,
      members: [],
    };
    for (let unauthorizedMember of unauthorizedWorkspace.members) {
      const member: MemberDevices = {
        id: unauthorizedMember.id,
        workspaceDevices: [],
      };
      for (let receiverDevice of unauthorizedMember.devices) {
        const { nonce, ciphertext } =
          await createAndEncryptWorkspaceKeyForDevice({
            receiverDeviceEncryptionPublicKey:
              receiverDevice.encryptionPublicKey,
            creatorDeviceEncryptionPrivateKey:
              activeDevice.encryptionPrivateKey!,
            workspaceKey,
          });
        member.workspaceDevices.push({
          receiverDeviceSigningPublicKey: receiverDevice.signingPublicKey,
          ciphertext,
          nonce,
        });
      }

      workspace.members.push(member);
    }
    workspaceMemberDevices.push(workspace);
  }
  return workspaceMemberDevices;
};
