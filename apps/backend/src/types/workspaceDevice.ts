import { WorkspaceKeyBox } from "./workspace";

export type WorkspaceDeviceParing = {
  receiverDeviceSigningPublicKey: string;
  nonce: string;
  ciphertext: string;
};

export type MemberDevices = {
  id: string; // userId
  workspaceDevices: WorkspaceDeviceParing[];
};

export type WorskpaceKeyMembers = {
  id: string; // workspaceKeyId;
  members: MemberDevices[];
};

export type WorkspaceMemberDevices = {
  id: string; // workspaceId
  workspaceKeysMembers: WorskpaceKeyMembers[];
};

export type MemberWithWorkspaceKeyBoxes = {
  id: string; // userId
  workspaceKeyBoxes: WorkspaceKeyBox[];
};

export type WorkspaceKeyWithMembers = {
  id: string; // workspaceKeyId
  generation: number;
  members: MemberWithWorkspaceKeyBoxes[];
};

export type WorkspaceMemberKeyBox = {
  id: string; // memberId;
  workspaceKeys: WorkspaceKeyWithMembers[];
};

export type WorkspaceWithWorkspaceDevicesParing = {
  id: string; // workspaceId;
  workspaceDevices: WorkspaceDeviceParing[];
};
