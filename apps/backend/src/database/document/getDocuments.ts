import { ForbiddenError } from "apollo-server-express";
import { Prisma } from "../../../prisma/generated/output";
import { prisma } from "../prisma";

type Cursor = {
  id: string;
};

type Params = {
  parentFolderId: string;
  userId: string;
  usingOldKeys?: boolean;
  cursor?: Cursor;
  skip?: number;
  take: number;
};

export async function getDocuments({
  userId,
  parentFolderId,
  usingOldKeys,
  cursor,
  skip,
  take,
}: Params) {
  try {
    return await prisma.$transaction(
      async (prisma) => {
        // get the document and determine it's workspace
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
          throw new Error("No workspaceKeys found");
        }
        const whereQuery: { [key: string]: any } = {
          workspaceId: parentFolder.workspaceId,
          parentFolderId: parentFolder.id,
          workspaceKey: {
            generation: {
              lt: latestWorkspaceKey.generation,
            },
          },
        };
        if (!usingOldKeys) {
          delete whereQuery.workspaceKey;
        }

        // then fetch the documents in that folder
        const documents = await prisma.document.findMany({
          where: whereQuery,
          cursor,
          skip,
          take,
          orderBy: {
            createdAt: "desc",
          },
        });

        return documents;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );
  } catch (error) {
    throw error;
  }
}
