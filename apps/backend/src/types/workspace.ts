import { CreatorDevice, Device } from "./device";

export type MemberIdWithDevice = {
  id: string;
  devices: Device[];
};

export type WorkspaceIdWithMemberDevices = {
  id: string;
  members: MemberIdWithDevice[];
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

export type Role = "ADMIN" | "EDITOR" | "COMMENTER" | "VIEWER";

export type WorkspaceMember = {
  userId: string;
  username: string | undefined | null;
  role: Role;
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
    (member: { userId: string; user: any; role: Role }) => {
      const workspaceMember: WorkspaceMember = {
        userId: member.userId,
        username: member.user.username,
        role: member.role,
      };
      members.push(workspaceMember);
    }
  );
  let currentWorkspaceKey: WorkspaceKey | undefined = undefined;
  if (workspace.workspaceKeys) {
    for (let workspaceKey of workspace.workspaceKeys) {
      if (!currentWorkspaceKey) {
        currentWorkspaceKey = workspaceKey;
      }
      if (workspaceKey.workspaceKeyBoxes) {
        workspaceKey.workspaceKeyBox = workspaceKey.workspaceKeyBoxes[0];
      }
    }
  }
  return {
    ...workspace,
    members: members,
    currentWorkspaceKey: currentWorkspaceKey,
  };
};
