import { KeyDerivationTrace } from "@naisho/core";
import { ForbiddenError } from "apollo-server-express";
import { prisma } from "../prisma";

type Params = {
  id: string;
  encryptedName: string;
  encryptedNameNonce: string;
  workspaceKeyId: string;
  subkeyId: number;
  userId: string;
  nameKeyDerivationTrace: KeyDerivationTrace;
};

export async function updateDocumentName({
  id,
  encryptedName,
  encryptedNameNonce,
  workspaceKeyId,
  subkeyId,
  userId,
  nameKeyDerivationTrace,
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
        data: {
          encryptedName,
          encryptedNameNonce,
          workspaceKeyId,
          subkeyId,
          nameKeyDerivationTrace,
        },
      });
      return updatedDocument;
    });
  } catch (error) {
    throw error;
  }
}
