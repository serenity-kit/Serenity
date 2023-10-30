import { WorkspaceInvitation } from "../../types/workspace";
import { prisma } from "../prisma";

type Params = {
  workspaceInvitationId: string;
};
export async function getWorkspaceInvitation({
  workspaceInvitationId,
}: Params): Promise<WorkspaceInvitation | null> {
  const rawWorkspaceInvitation = await prisma.workspaceInvitations.findFirst({
    where: { id: workspaceInvitationId, expiresAt: { gte: new Date() } },
    include: {
      inviterUser: { select: { username: true } },
    },
  });
  if (!rawWorkspaceInvitation) {
    return null;
  }
  const workspaceInvitation: WorkspaceInvitation = {
    ...rawWorkspaceInvitation,
    inviterUsername: rawWorkspaceInvitation.inviterUser.username,
  };
  return workspaceInvitation;
}
