import { ForbiddenError } from "apollo-server-express";
import { prisma } from "../prisma";

type Params = {
  id: string;
  name: string;
  userId: string;
};

export async function updateFolderName({ id, name, userId }: Params) {
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
        throw new ForbiddenError("Unauthorized");
      }
      const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
        where: {
          userId,
          workspaceId: folder.workspaceId,
        },
      });
      if (
        !userToWorkspace ||
        folder.workspaceId !== userToWorkspace.workspaceId
      ) {
        throw new ForbiddenError("Unauthorized");
      }
      const updatedFolder = await prisma.folder.update({
        where: {
          id,
        },
        data: {
          name,
        },
      });
      return updatedFolder;
    });
  } catch (error) {
    throw error;
  }
}
