import { CreatorDevice, Device } from "./device";

export type MemberIdWithDevice = {
  id: string;
  devices: Device[];
};

export type WorkspaceIdWithMemberDevices = {
  id: string;
  members: MemberIdWithDevice[];
};

export type KeyDerivationTraceParentFolder = {
  folderId: string;
  subkeyId: number;
  parentFolderId?: string | undefined | null;
};

export type KeyDerivationTrace = {
  workspaceKeyId: string;
  parentFolders: KeyDerivationTraceParentFolder[];
};

export type WorkspaceKeyBox = {
  id: string;
  workspaceKeyId: string;
  deviceSigningPublicKey: string;
  creatorDeviceSigningPublicKey: string;
  nonce: string;
  ciphertext: string;
  creatorDevice?: CreatorDevice | null | undefined;
};

export type WorkspaceKey = {
  id: string;
  workspaceId: string;
  generation: number;
  workspaceKeyBox?: WorkspaceKeyBox;
  workspaceKeyBoxes?: WorkspaceKeyBox[];
};

export type WorkspaceMember = {
  userId: string;
  username: string | undefined | null;
  isAdmin: boolean;
};

export type Workspace = {
  id: string;
  name: string;
  idSignature: string;
  members: WorkspaceMember[];
  workspaceKeys?: WorkspaceKey[];
  currentWorkspaceKey?: WorkspaceKey;
};

export type WorkspaceInvitation = {
  id: string;
  workspaceId: string;
  inviterUserId: string;
  inviterUsername: string;
  workspaceName: string | undefined;
  expiresAt: Date;
};

export const formatWorkspace = (workspace: any): Workspace => {
  const members: WorkspaceMember[] = [];
  workspace.usersToWorkspaces.forEach(
    (member: { userId: string; user: any; isAdmin: boolean }) => {
      const workspaceMember: WorkspaceMember = {
        userId: member.userId,
        username: member.user.username,
        isAdmin: member.isAdmin,
      };
      members.push(workspaceMember);
    }
  );
  return {
    ...workspace,
    members: members,
  };
};
