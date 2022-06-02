import { prisma } from "../prisma";
import { WorkspaceInvitation } from "../../types/workspace";

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
      isAdmin: true,
    },
  });
  if (!userToWorkspaces) {
    throw new Error("Unauthorized");
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
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  const workspaceInvitations: WorkspaceInvitation[] = [];
  rawWorkspaceInvitations.forEach((rawWorkspaceInvitation) => {
    workspaceInvitations.push({
      id: rawWorkspaceInvitation.id,
      workspaceId: rawWorkspaceInvitation.workspaceId,
      expiresAt: rawWorkspaceInvitation.expiresAt,
      inviterUserId: rawWorkspaceInvitation.inviterUserId,
      inviterUsername: rawWorkspaceInvitation.inviterUser.username,
    });
  });
  return workspaceInvitations;
}
