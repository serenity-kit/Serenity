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
      console.log({ userId, id });
      if (id === "012ba13f-542a-4ede-bc93-32d88dabae2b") {
        console.log("AAAAAAAAAAAA");
      }
      const document = await prisma.document.findUnique({
        where: {
          id,
        },
      });
      console.log({ document });
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
