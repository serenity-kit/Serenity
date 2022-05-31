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
    return await prisma.$transaction(async (prisma) => {
      // first make sure the user has access to the workspace
      const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
        where: {
          userId,
          workspaceId,
        },
      });
      if (!userToWorkspace) {
        throw Error("Unauthorized");
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
          name: "asc",
        },
      });
      return folders;
    });
  } catch (error) {
    throw error;
  }
}
