import { ForbiddenError } from "apollo-server-express";
import { prisma } from "../prisma";

type Params = {
  id: string;
  name: string;
  encryptedName?: string;
  encryptedNameNonce?: string;
  subkeyId?: number;
  userId: string;
};

export async function updateDocumentName({
  id,
  name,
  encryptedName,
  encryptedNameNonce,
  subkeyId,
  userId,
}: Params) {
  try {
    return await prisma.$transaction(async (prisma) => {
      // fetch the document
      // check if the user has access to the document
      // update the document
      // probably this could be refactored into one query.
      const document = await prisma.document.findFirst({
        where: {
          id,
        },
      });
      if (!document) {
        throw new ForbiddenError("Unauthorized");
      }
      const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
        where: {
          userId,
          workspaceId: document.workspaceId,
        },
      });
      if (
        !userToWorkspace ||
        document.workspaceId !== userToWorkspace.workspaceId
      ) {
        throw new ForbiddenError("Unauthorized");
      }
      const updatedDocument = await prisma.document.update({
        where: { id },
        data: { name, encryptedName, encryptedNameNonce, subkeyId },
      });
      return updatedDocument;
    });
  } catch (error) {
    throw error;
  }
}
