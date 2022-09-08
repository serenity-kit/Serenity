import { ForbiddenError } from "apollo-server-express";
import { prisma } from "../prisma";

type Params = {
  userId: string;
  workspaceId: string;
};

export async function getFirstDocument({ userId, workspaceId }: Params) {
  try {
    return await prisma.$transaction(async (prisma) => {
      // check if the user has access to the workspace
      const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
        where: {
          userId,
          workspaceId,
        },
      });
      if (!userToWorkspace) {
        throw new ForbiddenError("Unauthorized");
      }
      const document = await prisma.document.findFirst({
        where: {
          workspaceId,
        },
        orderBy: {
          createdAt: "asc",
        },
      });
      return document;
    });
  } catch (error) {
    throw error;
  }
}
