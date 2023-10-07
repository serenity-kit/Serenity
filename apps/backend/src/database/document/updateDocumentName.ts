import { ForbiddenError } from "apollo-server-express";
import { Prisma, Role } from "../../../prisma/generated/output";
import { prisma } from "../prisma";

type Params = {
  id: string;
  nameCiphertext: string;
  nameNonce: string;
  workspaceKeyId: string;
  subkeyId: number;
  userId: string;
};

export async function updateDocumentName({
  id,
  nameCiphertext,
  nameNonce,
  workspaceKeyId,
  subkeyId,
  userId,
}: Params) {
  const allowedRoles = [Role.ADMIN, Role.EDITOR];
  try {
    return await prisma.$transaction(
      async (prisma) => {
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
            nameCiphertext,
            nameNonce,
            workspaceKeyId,
            subkeyId,
          },
        });
        return updatedDocument;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );
  } catch (error) {
    throw error;
  }
}
