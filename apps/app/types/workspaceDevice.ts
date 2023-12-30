import { WorkspaceKeyBox } from "./workspace";

export type WorkspaceDeviceParing = {
  receiverDeviceSigningPublicKey: string;
  nonce: string;
  ciphertext: string;
};

export type MemberWithWorkspaceKeyBoxes = {
  id: string; // userId
  workspaceKeyBoxes: WorkspaceKeyBox[];
};

export type WorkspaceWithWorkspaceDevicesParing = {
  id: string; // workspaceId;
  workspaceKeyId: string;
  workspaceDevices: WorkspaceDeviceParing[];
};
