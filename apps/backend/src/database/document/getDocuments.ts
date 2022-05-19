import { prisma } from "../prisma";

type Cursor = {
  id?: string;
};

type Params = {
  parentFolderId: string;
  username: string;
  cursor?: Cursor;
  skip?: number;
  take: number;
};

export async function getDocuments({
  username,
  parentFolderId,
  cursor,
  skip,
  take,
}: Params) {
  try {
    return await prisma.$transaction(async (prisma) => {
      if (!parentFolderId) {
        throw Error("Parent folder id is required");
      }
      // get the document and determine it's workspace
      const parentFolder = await prisma.folder.findFirst({
        where: {
          id: parentFolderId,
        },
      });
      if (!parentFolder) {
        throw Error("Folder not found");
      }
      // then check if the user has access to the workspace
      const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
        where: {
          username,
          workspaceId: parentFolder.workspaceId,
        },
      });
      if (!userToWorkspace) {
        throw Error("Unauthorized");
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
