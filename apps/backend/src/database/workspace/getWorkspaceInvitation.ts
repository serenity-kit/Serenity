import { prisma } from "../prisma";
import { WorkspaceInvitation } from "../../types/workspace";

type Params = {
  workspaceInvitationId: string;
};
export async function getWorkspaceInvitation({
  workspaceInvitationId,
}: Params): Promise<WorkspaceInvitation | null> {
  const rawWorkspaceInvitation = await prisma.workspaceInvitations.findFirst({
    where: { id: workspaceInvitationId },
    select: {
      id: true,
      expiresAt: true,
      createdAt: true,
      workspaceId: true,
      inviterUserId: true,
      inviterUser: { select: { username: true } },
      workspace: { select: { name: true } },
    },
  });
  if (!rawWorkspaceInvitation) {
    return null;
  }
  const workspaceInvitation: WorkspaceInvitation = {
    id: rawWorkspaceInvitation.id,
    expiresAt: rawWorkspaceInvitation.expiresAt,
    workspaceId: rawWorkspaceInvitation.workspaceId,
    inviterUserId: rawWorkspaceInvitation.inviterUserId,
    inviterUsername: rawWorkspaceInvitation.inviterUser.username,
    workspaceName: rawWorkspaceInvitation.workspace.name,
  };
  return workspaceInvitation;
}
