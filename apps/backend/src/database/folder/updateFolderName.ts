import { prisma } from "../prisma";

type Params = {
  id: string;
  name: string;
  username: string;
};

export async function updateFolderName({ id, name, username }: Params) {
  try {
    return await prisma.$transaction(async (prisma) => {
      // fetch the folder
      // check if the user has access to the workspace
      // update the folder
      const folder = await prisma.folder.findFirst({
        where: {
          id,
        },
      });
      if (!folder) {
        throw Error("Folder not found");
      }
      const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
        where: {
          username,
          isAdmin: true,
          workspaceId: folder.workspaceId,
        },
      });
      if (
        !userToWorkspace ||
        folder.workspaceId !== userToWorkspace.workspaceId
      ) {
        throw Error("Unauthorized");
      }
      const updatedFolder = await prisma.folder.update({
        where: {
          id,
        },
        data: {
          name,
        },
      });
      console.log({ updatedFolder });
      return updatedFolder;
    });
  } catch (error) {
    throw error;
  }
}
