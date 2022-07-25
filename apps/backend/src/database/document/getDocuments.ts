import { ForbiddenError } from "apollo-server-express";
import { prisma } from "../prisma";

type Cursor = {
  id?: string;
};

type Params = {
  parentFolderId: string;
  userId: string;
  cursor?: Cursor;
  skip?: number;
  take: number;
};

export async function getDocuments({
  userId,
  parentFolderId,
  cursor,
  skip,
  take,
}: Params) {
  try {
    return await prisma.$transaction(async (prisma) => {
      // get the document and determine it's workspace
      const parentFolder = await prisma.folder.findFirst({
        where: {
          id: parentFolderId,
        },
      });
      if (!parentFolder) {
        throw new Error("Folder not found");
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
      // then fetch the documents in that folder
      const documents = await prisma.document.findMany({
        where: {
          workspaceId: parentFolder.workspaceId,
          parentFolderId: parentFolder.id,
        },
        cursor,
        skip,
        take,
        orderBy: {
          name: "asc",
        },
      });

      return documents;
    });
  } catch (error) {
    throw error;
  }
}
