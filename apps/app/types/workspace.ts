import { Role } from "../generated/graphql";

export type WorkspaceKeyBox = {
  id: string;
  workspaceKeyId: string;
  deviceSigningPublicKey: string;
  creatorDeviceSigningPublicKey: string;
  nonce: string;
  ciphertext: string;
};

export type WorkspaceKey = {
  id: string;
  workspaceId: string;
  generation: number;
  workspaceKeyBox: WorkspaceKeyBox;
};

export type WorkspaceMember = {
  userId: string;
  username: string | undefined | null;
  role: Role;
};

export type Workspace = {
  id: string;
  name: string;
  idSignature?: string;
  members: WorkspaceMember[];
  workspaceKeys?: WorkspaceKey[];
  currentWorkspaceKey?: WorkspaceKey;
};
