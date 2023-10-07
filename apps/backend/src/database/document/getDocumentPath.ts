import { ForbiddenError } from "apollo-server-express";
import { Folder, Prisma } from "../../../prisma/generated/output";
import { prisma } from "../prisma";

type Params = {
  id: string;
  userId: string;
};

const reduceParentFolderTreeToList = (folder: any): Folder[] => {
  let parentFolderList: Folder[] = [];
  if (folder["parentFolder"]) {
    parentFolderList = reduceParentFolderTreeToList(folder["parentFolder"]);
  }
  // this should present the folders in increasing order of specificity
  parentFolderList.push(folder);
  return parentFolderList;
};

export async function getDocumentPath({ userId, id }: Params) {
  try {
    return await prisma.$transaction(
      async (prisma) => {
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
        // if the document doesn't have a parent folder, return an empty array
        if (!document.parentFolderId) {
          return [];
        }
        // next we get the document's parent folder
        const parentFolder = await prisma.folder.findUnique({
          where: {
            id: document.parentFolderId,
          },
        });
        if (!parentFolder) {
          throw new ForbiddenError("Unauthorized");
        }

        // next let's build the folder tree up to this folder
        if (parentFolder.rootFolderId) {
          const relatedFolders = await prisma.folder.findMany({
            where: {
              rootFolderId: {
                in: [parentFolder.rootFolderId],
              },
            },
          });
          const rootFolder = await prisma.folder.findFirst({
            where: {
              id: {
                in: [parentFolder.rootFolderId],
              },
            },
          });
          if (rootFolder) {
            relatedFolders.push(rootFolder);
          }
          let lastOpenFolder: Folder = parentFolder;
          const relatedFoldersLookup = {};
          relatedFolders.forEach((f) => {
            f["parentFolder"] = null;
            relatedFoldersLookup[f.id] = f;
            if (f.id === parentFolder.id) {
              lastOpenFolder = f;
            }
          });
          relatedFolders.forEach((f) => {
            if (f.parentFolderId) {
              f["parentFolder"] = relatedFoldersLookup[f.parentFolderId];
            }
          });
          // go through parent folder tree and reduce it to a list
          const relatedFolderList =
            reduceParentFolderTreeToList(lastOpenFolder);
          return relatedFolderList;
        }
        return [parentFolder];
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );
  } catch (error) {
    throw error;
  }
}
