import { prisma } from "../prisma";
import { WorkspaceInvitation } from "../../types/workspace";
import { ForbiddenError } from "apollo-server-express";

// by default, invitation expires in 48 hours
const INVITATION_EXPIRATION_TIME = 48 * 60 * 60 * 1000;

type Params = {
  workspaceId: string;
  inviterUserId: string;
};

export async function createWorkspaceInvitation({
  workspaceId,
  inviterUserId,
}: Params) {
  const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
    where: {
      userId: inviterUserId,
      workspaceId,
      isAdmin: true,
    },
    select: {
      userId: true,
      user: {
        select: {
          id: true,
          username: true,
        },
      },
      workspaceId: true,
      workspace: {
        select: {
          id: true,
          name: true,
        },
      },
      isAdmin: true,
    },
  });
  if (!userToWorkspace || !userToWorkspace.isAdmin) {
    throw new ForbiddenError("Unauthorized");
  }
  const rawWorkspaceInvitation = await prisma.workspaceInvitations.create({
    data: {
      workspaceId,
      inviterUserId,
      expiresAt: new Date(Date.now() + INVITATION_EXPIRATION_TIME),
    },
  });
  const workspaceInvitation: WorkspaceInvitation = {
    id: rawWorkspaceInvitation.id,
    workspaceId: rawWorkspaceInvitation.workspaceId,
    inviterUserId: rawWorkspaceInvitation.inviterUserId,
    expiresAt: rawWorkspaceInvitation.expiresAt,
    inviterUsername: userToWorkspace.user.username,
    workspaceName: userToWorkspace.workspace.name,
  };
  return workspaceInvitation;
}
