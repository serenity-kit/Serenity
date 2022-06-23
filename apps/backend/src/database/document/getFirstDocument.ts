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
        throw Error("Unauthorized");
      }
      // fetch the first document
      const documents = await prisma.document.findFirst({
        where: {
          workspaceId,
        },
        orderBy: {
          name: "asc",
        },
      });

      return documents;
    });
  } catch (error) {
    throw error;
  }
}
