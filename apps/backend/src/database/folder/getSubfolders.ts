import { ForbiddenError } from "apollo-server-express";
import { prisma } from "../prisma";

type Cursor = {
  id?: string;
};

type Params = {
  parentFolderId: string;
  userId: string;
  usingOldKeys?: boolean;
  cursor?: Cursor;
  skip?: number;
  take: number;
};

export async function getSubfolders({
  userId,
  parentFolderId,
  usingOldKeys,
  cursor,
  skip,
  take,
}: Params) {
  try {
    return await prisma.$transaction(async (prisma) => {
      // get the folder and determine it's workspace
      if (!parentFolderId) {
        throw new Error("Parent folder id is required");
      }
      const parentFolder = await prisma.folder.findFirst({
        where: {
          id: parentFolderId,
        },
      });
      if (!parentFolder) {
        throw new ForbiddenError("Unauthorized");
      }
      // then check if the user has access to the workspace
      const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
        where: {
          userId,
          workspaceId: parentFolder.workspaceId,
          isAuthorizedMember: true,
        },
      });
      if (!userToWorkspace) {
        throw new ForbiddenError("Unauthorized");
      }
      const latestWorkspaceKey = await prisma.workspaceKey.findFirst({
        where: { workspaceId: userToWorkspace.workspaceId },
        select: { generation: true },
        orderBy: { generation: "desc" },
      });
      if (!latestWorkspaceKey) {
        throw new Error("No workspace keys found");
      }
      const whereQuery: { [x: string]: any } = {
        workspaceId: parentFolder.workspaceId,
        parentFolderId: parentFolderId,
        workspaceKey: {
          generation: {
            lt: latestWorkspaceKey.generation,
            lte: latestWorkspaceKey.generation,
          },
        },
      };

      if (usingOldKeys) {
        delete whereQuery.workspaceKey.generation.lte;
      } else {
        delete whereQuery.workspaceKey.generation.lt;
      }
      // get non-latest key
      // then fetch the folders where folder is their parent
      const folders = await prisma.folder.findMany({
        where: whereQuery,
        cursor,
        skip,
        take,
        orderBy: {
          createdAt: "desc",
        },
      });
      return folders;
    });
  } catch (error) {
    throw error;
  }
}
