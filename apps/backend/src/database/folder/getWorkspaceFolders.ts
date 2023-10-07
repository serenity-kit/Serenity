import { ForbiddenError } from "apollo-server-express";
import { Prisma } from "../../../prisma/generated/output";
import { prisma } from "../prisma";

type Cursor = {
  id?: string;
};

type Params = {
  workspaceId: string;
  userId: string;
  cursor?: Cursor;
  skip?: number;
  take: number;
};

export async function getWorkspaceFolders({
  userId,
  workspaceId,
  cursor,
  skip,
  take,
}: Params) {
  try {
    return await prisma.$transaction(
      async (prisma) => {
        // first make sure the user has access to the workspace
        const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
          where: {
            userId,
            workspaceId,
          },
        });
        if (!userToWorkspace) {
          throw new ForbiddenError("Unauthorized");
        }
        // then fetch the folders where there is no parent folder
        const folders = await prisma.folder.findMany({
          where: {
            workspaceId,
            parentFolderId: null,
          },
          cursor,
          skip,
          take,
          orderBy: {
            createdAt: "desc",
          },
        });
        return folders;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );
  } catch (error) {
    throw error;
  }
}
