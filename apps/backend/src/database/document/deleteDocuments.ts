import { ForbiddenError } from "apollo-server-express";
import { Role } from "../../../prisma/generated/output";
import { prisma } from "../prisma";

type Params = {
  documentIds: string[];
  workspaceId: string;
  userId: string;
};

export async function deleteDocuments({
  documentIds,
  workspaceId,
  userId,
}: Params) {
  const allowedRoles = [Role.ADMIN, Role.EDITOR];
  try {
    await prisma.$transaction(async (prisma) => {
      const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
        where: { userId, workspaceId, role: { in: allowedRoles } },
      });
      if (!userToWorkspace) {
        throw new ForbiddenError("Unauthorized");
      }
      await prisma.document.deleteMany({
        where: {
          id: { in: documentIds },
          workspaceId,
        },
      });
    });
  } catch (error) {
    throw error;
  }
}
