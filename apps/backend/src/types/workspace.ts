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
};

export type WorkspaceInvitation = {
  id: string;
  workspaceId: string;
  inviterUserId: string;
  inviterUsername: string | undefined;
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
