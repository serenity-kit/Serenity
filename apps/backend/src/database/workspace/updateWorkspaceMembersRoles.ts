import { ForbiddenError } from "apollo-server-express";
import { formatWorkspace, Workspace } from "../../types/workspace";
import { prisma } from "../prisma";

export type WorkspaceMemberParams = {
  userId: string;
  isAdmin: boolean;
};

type Params = {
  id: string;
  userId: string;
  members: WorkspaceMemberParams[];
};

export async function updateWorkspaceMembersRoles({
  id,
  userId,
  members,
}: Params): Promise<Workspace> {
  try {
    return await prisma.$transaction(async (prisma) => {
      // 1. retrieve workspace if owned by user
      // 2. update usersToWorkspaces with new member structures
      const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
        where: {
          userId,
          isAdmin: true,
          workspaceId: id,
        },
        select: {
          workspaceId: true,
          isAdmin: true,
        },
      });
      if (!userToWorkspace || !userToWorkspace.isAdmin) {
        throw new ForbiddenError("Unauthorized");
      }
      const workspace = await prisma.workspace.findFirst({
        where: {
          id: userToWorkspace.workspaceId,
        },
      });
      if (!workspace) {
        throw new Error("Invalid workspaceId");
      }

      const searchingUserIds: string[] = [];
      const memberIdLookup: { [id: string]: any } = {};
      members.forEach((member) => {
        searchingUserIds.push(member.userId);
        memberIdLookup[member.userId] = member;
      });
      const usersToWorkspace = await prisma.usersToWorkspaces.findMany({
        where: {
          userId: { in: searchingUserIds, not: userId },
          workspaceId: id,
        },
        select: { userId: true },
      });
      const validAdminUserIds: string[] = [];
      const validNonAdminUserIds: string[] = [];
      usersToWorkspace.forEach((userToWorkspace) => {
        const member = memberIdLookup[userToWorkspace.userId];
        if (member.isAdmin) {
          validAdminUserIds.push(userToWorkspace.userId);
        } else {
          validNonAdminUserIds.push(userToWorkspace.userId);
        }
      });
      const validUserIds = usersToWorkspace.map(
        (userToWorkspace) => userToWorkspace.userId
      );
      await prisma.usersToWorkspaces.updateMany({
        where: { userId: { in: validAdminUserIds } },
        data: { isAdmin: true },
      });
      await prisma.usersToWorkspaces.updateMany({
        where: { userId: { in: validNonAdminUserIds } },
        data: { isAdmin: false },
      });
      const updatedWorkspace = await prisma.workspace.findFirst({
        where: { id: userToWorkspace.workspaceId },
        include: {
          usersToWorkspaces: { include: { user: true } },
        },
      });
      return formatWorkspace(updatedWorkspace);
    });
  } catch (error) {
    throw error;
  }
}
