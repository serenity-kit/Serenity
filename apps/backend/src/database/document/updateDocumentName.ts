import { KeyDerivationTrace } from "@naisho/core";
import { ForbiddenError } from "apollo-server-express";
import { Role } from "../../../prisma/generated/output";
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
  const allowedRoles = [Role.ADMIN, Role.EDITOR];
  try {
    return await prisma.$transaction(async (prisma) => {
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
          role: { in: allowedRoles },
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
