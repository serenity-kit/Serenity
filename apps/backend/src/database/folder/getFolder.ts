import { Folder } from "../../types/folder";
import { prisma } from "../prisma";

type Params = {
  id: string;
  userId: string;
};

const toFolderType = (folder: any): Folder => {
  return {
    id: folder.id,
    name: folder.name,
    idSignature: folder.idSignature,
    parentFolderId: folder.parentFolderId,
    rootFolderId: folder.rootFolderId,
    workspaceId: folder.workspaceId,
    parentFolders: [],
  };
};

const reduceParentFolderTreeToList = (folder: any) => {
  const parentFolderList = [folder];
  if (folder["parentFolder"]) {
    parentFolderList.concat(
      reduceParentFolderTreeToList(folder["parentFolder"])
    );
  }
  return parentFolderList;
};

export async function getFolder({ userId, id }: Params) {
  try {
    return await prisma.$transaction(async (prisma) => {
      // make sure the user has access to the workspace
      // by retrieving and verifying the workspace
      const rawFolder = await prisma.folder.findUnique({
        where: {
          id,
        },
      });
      if (!rawFolder) {
        throw Error("Folder not found");
      }
      const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
        where: {
          userId,
          workspaceId: rawFolder.workspaceId,
        },
      });
      if (!userToWorkspace) {
        throw Error("Unauthorized");
      }
      // next let's build the folder tree up to this folder
      const folder = toFolderType(rawFolder);
      folder.parentFolders = [];
      if (rawFolder.rootFolderId) {
        const relatedFolders = await prisma.folder.findMany({
          where: {
            rootFolderId: {
              in: [rawFolder.rootFolderId],
            },
          },
        });
        const rootFolder = await prisma.folder.findUnique({
          where: {
            id: rawFolder.rootFolderId,
          },
        });

        const treeFolderLookup = {
          [rawFolder.rootFolderId]: toFolderType(rootFolder),
        };
        relatedFolders.forEach((relatedFolder) => {
          treeFolderLookup[relatedFolder.id] = toFolderType(relatedFolder);
        });

        // trace the parent folders back up to the root
        let parentFolderId = folder.parentFolderId;
        const parentFolderList: Folder[] = [];
        while (parentFolderId) {
          const parentFolder = treeFolderLookup[parentFolderId];
          parentFolderList.push(parentFolder);
          parentFolderId = parentFolder.parentFolderId;
        }
        folder.parentFolders = parentFolderList;
      }
      return folder;
    });
  } catch (error) {
    throw error;
  }
}
