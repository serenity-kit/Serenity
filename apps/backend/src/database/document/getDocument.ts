import { ForbiddenError } from "apollo-server-express";
import { Prisma } from "../../../prisma/generated/output";
import { prisma } from "../prisma";

type Params = {
  id: string;
  userId: string;
};

export async function getDocument({ userId, id }: Params) {
  return await prisma.$transaction(
    async (prisma) => {
      // make sure the user has access to the workspace
      // by retrieving and verifying the workspace connection
      const document = await prisma.document.findUnique({
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
      if (!userToWorkspace) {
        throw new ForbiddenError("Unauthorized");
      }
      return document;
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );
}
