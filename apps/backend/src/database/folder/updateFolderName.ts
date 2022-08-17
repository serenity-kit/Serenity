import { ForbiddenError, UserInputError } from "apollo-server-express";
import { prisma } from "../prisma";

type Params = {
  id: string;
  name?: string;
  encryptedName: string;
  encryptedNameNonce: string;
  subkeyId: number;
  userId: string;
};

export async function updateFolderName({
  id,
  name,
  encryptedName,
  encryptedNameNonce,
  subkeyId,
  userId,
}: Params) {
  try {
    return await prisma.$transaction(async (prisma) => {
      const folderWithSubkeyId = await prisma.folder.findFirst({
        where: { subKeyId: subkeyId },
        select: { id: true },
      });
      if (folderWithSubkeyId) {
        throw new UserInputError("Invalid input: duplicate subkeyId");
      }
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
          encryptedName,
          encryptedNameNonce,
          subKeyId: subkeyId,
        },
      });
      return updatedFolder;
    });
  } catch (error) {
    throw error;
  }
}
