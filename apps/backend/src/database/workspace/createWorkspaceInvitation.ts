import { ForbiddenError } from "apollo-server-express";
import { Role } from "../../../prisma/generated/output";
import { WorkspaceInvitation } from "../../types/workspace";
import { prisma } from "../prisma";

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
      role: Role.ADMIN,
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
      role: true,
    },
  });
  if (!userToWorkspace || !userToWorkspace.role) {
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
