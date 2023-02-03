import {
  decryptWorkspaceKey,
  encryptWorkspaceKeyForDevice,
} from "@serenity-tools/common";
import {
  WorkspaceDevicePairingInput,
  WorkspaceKeyDeviceInput,
} from "../../generated/graphql";
import { Device } from "../../types/Device";
import { MemberDevices } from "../../types/workspaceDevice";
import { getWorkspaces } from "../workspace/getWorkspaces";

export type Props = {
  unauthorizedWorkspaceDevices: any;
  activeDevice: Device;
};
export const createWorkspaceMemberDevices = async ({
  activeDevice,
  unauthorizedWorkspaceDevices,
}: Props): Promise<WorkspaceDevicePairingInput[]> => {
  // derive all workspace keys for all workspaces
  const workspaces = await getWorkspaces({
    deviceSigningPublicKey: activeDevice.signingPublicKey,
  });
  if (!workspaces) {
    throw new Error("No workspaces found");
  }
  const workspaceKeyLookup: {
    [workspaceId: string]: { [workspaceKeyId: string]: string };
  } = {};
  for (let workspace of workspaces) {
    if (!workspace.workspaceKeys) {
      // TODO: handle error. This workspace has no workspaceKeys
      continue;
    }
    const workspaceId = workspace.id;
    if (!workspaceKeyLookup[workspaceId]) {
      workspaceKeyLookup[workspaceId] = {};
    }
    for (let workspaceKey of workspace.workspaceKeys) {
      const workspaceKeyId = workspaceKey.id;
      const workspaceKeyBox = workspaceKey.workspaceKeyBox;
      if (!workspaceKeyBox) {
        // This device isn't registered for this workspace
        continue;
      }
      const workspaceKeyString = decryptWorkspaceKey({
        ciphertext: workspaceKeyBox.ciphertext,
        nonce: workspaceKeyBox.nonce,
        creatorDeviceEncryptionPublicKey:
          workspaceKeyBox.creatorDevice?.encryptionPublicKey!,
        receiverDeviceEncryptionPrivateKey: activeDevice.encryptionPrivateKey!,
      });
      workspaceKeyLookup[workspaceId][workspaceKeyId] = workspaceKeyString;
    }
  }
  // create workspaceDevicePairingInputs for all unauthorizedWorkspaceDevices
  const workspaceMemberDevices: WorkspaceDevicePairingInput[] = [];
  for (let unauthorizedWorkspace of unauthorizedWorkspaceDevices) {
    const workspaceKeys = workspaceKeyLookup[unauthorizedWorkspace.id];
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
          const { nonce, ciphertext } = encryptWorkspaceKeyForDevice({
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
