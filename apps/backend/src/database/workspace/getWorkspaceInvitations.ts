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
  // check if this user is an admin of the workspace
  // if so, grab all workspace invitations for that workspace
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
  const workspaceInvitations = await prisma.workspaceInvitations.findMany({
    where: {
      workspaceId,
      expiresAt: {
        gt: new Date(),
      },
    },
  });
  return workspaceInvitations;
}
