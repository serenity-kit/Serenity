import { ForbiddenError } from "apollo-server-express";
import { prisma } from "../prisma";

type Params = {
  id: string;
  userId: string;
};

export async function getDocument({ userId, id }: Params) {
  try {
    return await prisma.$transaction(async (prisma) => {
      // make sure the user has access to the workspace
      // by retrieving and verifying the workspace
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
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
}
