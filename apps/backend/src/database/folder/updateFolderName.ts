import { KeyDerivationTrace2 } from "@naisho/core";
import { ForbiddenError, UserInputError } from "apollo-server-express";
import { Role } from "../../../prisma/generated/output";
import { prisma } from "../prisma";

type Params = {
  id: string;
  nameCiphertext: string;
  nameNonce: string;
  workspaceKeyId: string;
  subkeyId: number;
  userId: string;
  keyDerivationTrace: KeyDerivationTrace2;
};

export async function updateFolderName({
  id,
  nameCiphertext,
  nameNonce,
  workspaceKeyId,
  subkeyId,
  userId,
  keyDerivationTrace,
}: Params) {
  const allowedRoles = [Role.ADMIN, Role.EDITOR];
  return await prisma.$transaction(async (prisma) => {
    const folderWithSubkeyId = await prisma.folder.findFirst({
      where: { subkeyId, id: { not: id } },
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
        role: { in: allowedRoles },
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
        nameCiphertext,
        nameNonce,
        workspaceKeyId,
        subkeyId,
        keyDerivationTrace,
      },
    });
    return updatedFolder;
  });
}
