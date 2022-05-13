import { prisma } from "../prisma";

type Params = {
  username: string;
  id: string;
  parentFolderId?: string;
  workspaceId: string;
};

export async function createFolder({
  username,
  id,
  parentFolderId,
  workspaceId,
}: Params) {
  try {
    await prisma.$transaction(async (prisma) => {
      // make sure we have permissions to do stuff with this workspace
      const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
        where: {
          username,
          workspaceId,
          isAdmin: true,
        },
      });
      if (!userToWorkspace) {
        throw Error("Unauthorized");
      }
      // if there is a parentId, then grab it's root folder id for our own
      let rootFolderId: string | null = null;
      if (parentFolderId) {
        const parentFolder = await prisma.folder.findFirst({
          where: {
            id: parentFolderId,
            workspaceId: workspaceId,
          },
        });
        if (!parentFolder) {
          throw Error("Parent folder not found");
        }
        rootFolderId = parentFolder.rootFolderId;
      }
      const folder = prisma.folder.create({
        data: {
          id,
          idSignature: "TODO",
          name: "Untitled",
          parentFolderId,
          rootFolderId,
          workspaceId,
        },
      });
      return folder;
    });
  } catch (error) {
    throw error;
  }
}
