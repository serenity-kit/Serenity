import { ForbiddenError } from "apollo-server-express";
import { Role } from "../../../prisma/generated/output";
import { formatWorkspace, Workspace } from "../../types/workspace";
import { prisma } from "../prisma";

export type WorkspaceMemberParams = {
  userId: string;
  role: Role;
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
  return await prisma.$transaction(async (prisma) => {
    // 1. retrieve workspace if owned by user
    // 2. update usersToWorkspaces with new member structures
    const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
      where: {
        userId,
        role: Role.ADMIN,
        workspaceId: id,
      },
      select: {
        workspaceId: true,
        role: true,
      },
    });
    if (!userToWorkspace || !userToWorkspace.role) {
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
    const validViewerUserIds: string[] = [];
    usersToWorkspace.forEach((userToWorkspace) => {
      const member = memberIdLookup[userToWorkspace.userId];
      if (member.role === Role.ADMIN) {
        validAdminUserIds.push(userToWorkspace.userId);
      } else {
        validViewerUserIds.push(userToWorkspace.userId);
      }
    });
    await prisma.usersToWorkspaces.updateMany({
      where: { userId: { in: validAdminUserIds } },
      data: { role: Role.ADMIN },
    });
    await prisma.usersToWorkspaces.updateMany({
      where: { workspaceId: id, userId: { in: validViewerUserIds } },
      data: { role: Role.EDITOR },
    });
    const updatedWorkspace = await prisma.workspace.findFirstOrThrow({
      where: { id },
      include: {
        usersToWorkspaces: {
          include: {
            user: {
              select: {
                username: true,
                devices: {
                  select: {
                    signingPublicKey: true,
                    encryptionPublicKey: true,
                    encryptionPublicKeySignature: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return formatWorkspace(updatedWorkspace);
  });
}
