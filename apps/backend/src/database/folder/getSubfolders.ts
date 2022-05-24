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

export async function getSubfolders({
  userId,
  parentFolderId,
  cursor,
  skip,
  take,
}: Params) {
  try {
    return await prisma.$transaction(async (prisma) => {
      // get the folder and determine it's workspace
      if (!parentFolderId) {
        throw Error("Parent folder id is required");
      }
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
          userId,
          workspaceId: parentFolder.workspaceId,
        },
      });
      if (!userToWorkspace) {
        throw Error("Unauthorized");
      }
      // then fetch the folders where folder is their parent
      const folders = await prisma.folder.findMany({
        where: {
          workspaceId: parentFolder.workspaceId,
          parentFolderId: parentFolderId,
        },
        cursor,
        skip,
        take,
        orderBy: {
          name: "asc",
        },
      });
      return folders;
    });
  } catch (error) {
    throw error;
  }
}
