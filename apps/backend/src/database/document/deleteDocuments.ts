import { prisma } from "../prisma";

type Params = {
  documentIds: string[];
  userId: string;
};

export async function deleteDocuments({ documentIds, userId }: Params) {
  try {
    await prisma.$transaction(async (prisma) => {
      // get the workspace ids for the user
      // find documents with the matching document ids and workspace ids
      // delete these documents
      const userToWorkspaces = await prisma.usersToWorkspaces.findMany({
        where: {
          userId,
          isAdmin: true,
        },
      });
      if (!userToWorkspaces || !userToWorkspaces.length) {
        return null;
      }
      const workspaceIds = userToWorkspaces.map(
        (userToWorkspace) => userToWorkspace.workspaceId
      );
      await prisma.document.deleteMany({
        where: {
          id: {
            in: documentIds,
          },
          workspaceId: {
            in: workspaceIds,
          },
        },
      });
    });
  } catch (error) {
    throw error;
  }
}
