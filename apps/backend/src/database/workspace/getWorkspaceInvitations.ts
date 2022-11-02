import { ForbiddenError } from "apollo-server-express";
import { Role } from "../../../prisma/generated/output";
import { WorkspaceInvitation } from "../../types/workspace";
import { prisma } from "../prisma";

type Cursor = {
  id?: string;
};

type Params = {
  userId: string;
  workspaceId: string;
  cursor?: Cursor;
  skip?: number;
  take: number;
};
export async function getWorkspaceInvitations({
  userId,
  workspaceId,
  cursor,
  skip,
  take,
}: Params): Promise<WorkspaceInvitation[]> {
  const userToWorkspaces = await prisma.usersToWorkspaces.findFirst({
    where: {
      userId,
      workspaceId,
      role: Role.ADMIN,
    },
  });
  if (!userToWorkspaces) {
    throw new ForbiddenError("Unauthorized");
  }
  const rawWorkspaceInvitations = await prisma.workspaceInvitations.findMany({
    where: {
      workspaceId,
      expiresAt: {
        gt: new Date(),
      },
    },
    select: {
      id: true,
      expiresAt: true,
      createdAt: true,
      workspaceId: true,
      inviterUserId: true,
      inviterUser: {
        select: {
          username: true,
        },
      },
      workspace: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  const workspaceInvitations: WorkspaceInvitation[] = [];
  rawWorkspaceInvitations.forEach((rawWorkspaceInvitation) => {
    const workspaceInvitation: WorkspaceInvitation = {
      id: rawWorkspaceInvitation.id,
      workspaceId: rawWorkspaceInvitation.workspaceId,
      workspaceName: rawWorkspaceInvitation.workspace.name,
      expiresAt: rawWorkspaceInvitation.expiresAt,
      inviterUserId: rawWorkspaceInvitation.inviterUserId,
      inviterUsername: rawWorkspaceInvitation.inviterUser.username,
    };
    workspaceInvitations.push(workspaceInvitation);
  });
  return workspaceInvitations;
}
