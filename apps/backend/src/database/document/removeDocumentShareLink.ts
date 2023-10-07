import { ForbiddenError, UserInputError } from "apollo-server-express";
import { Prisma, Role } from "../../../prisma/generated/output";
import { prisma } from "../prisma";

export type Props = {
  token: string;
  sharerUserId: string;
};
export const removeDocumentShareLink = async ({
  token,
  sharerUserId,
}: Props) => {
  return await prisma.$transaction(
    async (prisma) => {
      const documentShareLink = await prisma.documentShareLink.findFirst({
        where: { token },
      });
      if (!documentShareLink) {
        throw new UserInputError("Invalid token");
      }
      const documentId = documentShareLink.documentId;
      const document = await prisma.document.findFirst({
        where: { id: documentId },
      });
      if (!document) {
        throw new ForbiddenError("Unauthorized");
      }
      const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
        where: {
          workspaceId: document.workspaceId,
          userId: sharerUserId,
          role: { in: [Role.ADMIN, Role.EDITOR] },
        },
      });
      if (!userToWorkspace) {
        throw new ForbiddenError("Unauthorized");
      }
      await prisma.document.update({
        where: { id: documentId },
        data: { requiresSnapshot: true },
      });
      await prisma.documentShareLink.delete({
        where: { token },
      });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );
};
