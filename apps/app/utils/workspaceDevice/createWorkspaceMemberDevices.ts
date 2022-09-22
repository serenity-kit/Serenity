import { Client } from "urql";
import { Device } from "../../types/Device";
import {
  MemberDevices,
  WorkspaceMemberDevices,
} from "../../types/workspaceDevice";
import { createAndEncryptWorkspaceKeyForDevice } from "../device/createAndEncryptWorkspaceKeyForDevice";
import { getWorkspaceKey } from "../workspace/getWorkspaceKey";

export type Props = {
  unauthorizedWorkspaceDevices: any;
  urqlClient: Client;
  activeDevice: Device;
};
export const createWorkspaceMemberDevices = async ({
  activeDevice,
  unauthorizedWorkspaceDevices,
  urqlClient,
}: Props) => {
  const workspaceMemberDevices: WorkspaceMemberDevices[] = [];
  for (let unauthorizedWorkspace of unauthorizedWorkspaceDevices) {
    let workspaceKey: string | undefined = undefined;
    try {
      workspaceKey = await getWorkspaceKey({
        workspaceId: unauthorizedWorkspace.id,
        urqlClient,
        activeDevice,
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
