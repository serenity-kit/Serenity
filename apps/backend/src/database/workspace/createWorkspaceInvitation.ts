import { prisma } from "../prisma";
import { WorkspaceInvitation } from "../../types/workspace";

// by default, invitation expires in 48 hours
const INVITATION_EXPIRATION_TIME = 48 * 60 * 60 * 1000;

type Params = {
  workspaceId: string;
  inviterUserId: string;
};

export async function createWorkspaceInvitation({
  workspaceId,
  inviterUserId,
}: Params): Promise<WorkspaceInvitation> {
  // check if the user has access to this workspace
  const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
    where: {
      userId: inviterUserId,
      workspaceId,
      isAdmin: true,
    },
  });
  if (!userToWorkspace) {
    throw new Error("Unauthorized");
  }
  const workspaceInvitation = await prisma.workspaceInvitations.create({
    data: {
      workspaceId,
      inviterUserId,
      expiresAt: new Date(Date.now() + INVITATION_EXPIRATION_TIME),
    },
  });
  return workspaceInvitation;
}
