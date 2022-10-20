import {
  WorkspaceDevicePairingInput,
  WorkspaceKeyDeviceInput,
} from "../../generated/graphql";
import { Device } from "../../types/Device";
import { MemberDevices } from "../../types/workspaceDevice";
import { createAndEncryptWorkspaceKeyForDevice } from "../device/createAndEncryptWorkspaceKeyForDevice";
import { getWorkspaceKeys } from "../workspace/getWorskpaceKeys";

export type Props = {
  unauthorizedWorkspaceDevices: any;
  activeDevice: Device;
};
export const createWorkspaceMemberDevices = async ({
  activeDevice,
  unauthorizedWorkspaceDevices,
}: Props): Promise<WorkspaceDevicePairingInput[]> => {
  const workspaceMemberDevices: WorkspaceDevicePairingInput[] = [];
  for (let unauthorizedWorkspace of unauthorizedWorkspaceDevices) {
    let workspaceKeys: { [workspaceKeyId: string]: string } | undefined =
      undefined;
    try {
      workspaceKeys = await getWorkspaceKeys({
        workspaceId: unauthorizedWorkspace.id,
        activeDevice,
      });
    } catch (error) {
      // we don't have access to this workspace yet, can't decrypt
      console.log("Couldn't get workspace keys for this workspace.");
      continue;
    }
    const workspaceMemberDevice: WorkspaceDevicePairingInput = {
      id: unauthorizedWorkspace.id,
      workspaceKeysMembers: [],
    };

    for (let workspaceKeyId of Object.keys(workspaceKeys)) {
      const workspaceKeyMember: WorkspaceKeyDeviceInput = {
        id: workspaceKeyId,
        members: [],
      };
      const workspaceKeyString = workspaceKeys[workspaceKeyId];
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
              workspaceKey: workspaceKeyString,
            });
          member.workspaceDevices.push({
            receiverDeviceSigningPublicKey: receiverDevice.signingPublicKey,
            ciphertext,
            nonce,
          });
        }
        workspaceKeyMember.members.push(member);
      }
      workspaceMemberDevice.workspaceKeysMembers.push(workspaceKeyMember);
    }
    workspaceMemberDevices.push(workspaceMemberDevice);
  }
  return workspaceMemberDevices;
};
