import { Client } from "urql";
import {
  MemberDevices,
  WorkspaceMemberDevices,
} from "../../types/workspaceDevice";
import { createAndEncryptWorkspaceKeyForDevice } from "../device/createAndEncryptWorkspaceKeyForDevice";
import { getActiveDevice } from "../device/getActiveDevice";
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
  const workspaceMemberDevices: WorkspaceMemberDevices[] = [];
  for (let unauthorizedWorkspace of unauthorizedWorkspaceDevices) {
    let workspaceKey: string | undefined = undefined;
    try {
      workspaceKey = await getWorkspaceKey({
        workspaceId: unauthorizedWorkspace.id,
        urqlClient,
      });
    } catch (error) {
      // we don't have access to this workspace yet, can't decrypt
      continue;
    }
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
