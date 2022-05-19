import { prisma } from "../prisma";
import { Folder } from "../../types/folder";

type Params = {
  username: string;
  id: string;
  name?: string;
  parentFolderId?: string;
  workspaceId: string;
};

export async function createFolder({
  username,
  id,
  name,
  parentFolderId,
  workspaceId,
}: Params) {
  let folderName = "Untitled";
  if (name) {
    folderName = name;
  }
  try {
    return await prisma.$transaction(async (prisma) => {
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
        if (parentFolder.rootFolderId) {
          rootFolderId = parentFolder.rootFolderId;
        } else {
          rootFolderId = parentFolder.id;
        }
      }
      const rawFolder = await prisma.folder.create({
        data: {
          id,
          idSignature: "TODO",
          name: folderName,
          parentFolderId,
          rootFolderId,
          workspaceId,
        },
      });
      const folder: Folder = {
        id: rawFolder.id,
        name: rawFolder.name,
        idSignature: rawFolder.idSignature,
        parentFolderId: rawFolder.parentFolderId,
        rootFolderId: rawFolder.rootFolderId,
        workspaceId: rawFolder.workspaceId,
        parentFolders: [],
      };
      return folder;
    });
  } catch (error) {
    throw error;
  }
}
