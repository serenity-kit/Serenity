import { prisma } from "../prisma";

type Params = {
  id: string;
  name: string;
  username: string;
};

export async function updateDocumentName({ id, name, username }: Params) {
  try {
    return await prisma.$transaction(async (prisma) => {
      // fetch the document
      // check if the user has access to the document
      // update the document
      // probably this could be refactored into one query.
      const document = await prisma.document.findFirst({
        where: {
          id,
        },
      });
      if (!document) {
        throw Error("Document not found");
      }
      const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
        where: {
          username,
          isAdmin: true,
          workspaceId: document.workspaceId,
        },
      });
      if (
        !userToWorkspace ||
        document.workspaceId !== userToWorkspace.workspaceId
      ) {
        throw Error("Unauthorized");
      }
      const updatedDocument = await prisma.document.update({
        where: { id },
        data: { name },
      });
      return updatedDocument;
    });
  } catch (error) {
    throw error;
  }
}
