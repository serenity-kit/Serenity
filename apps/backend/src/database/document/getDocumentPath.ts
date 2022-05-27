import { ClientRequestResetPasswordRequest } from "../../graphql/mutations/authentication/initializeChangePassword";
import { prisma } from "../prisma";

type Params = {
  id: string;
  username: string;
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

export async function getDocumentPath({ username, id }: Params) {
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
        throw Error("Document not found");
      }
      const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
        where: {
          username,
          workspaceId: document.workspaceId,
        },
      });
      if (!userToWorkspace) {
        throw Error("Unauthorized");
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
        throw Error("Folder not found");
      }

      // next let's build the folder tree up to this folder
      if (parentFolder.rootFolderId) {
        const relatedFolders = await prisma.folder.findMany({
          where: {
            id: {
              in: [parentFolder.rootFolderId],
            },
          },
        });
        const relatedFoldersLookup = {};
        relatedFolders.forEach((f) => {
          f["parentFolder"] = null;
          relatedFoldersLookup[f.id] = f;
        });
        relatedFolders.forEach((f) => {
          if (f.parentFolderId) {
            f["parentFolder"] = relatedFoldersLookup[f.parentFolderId];
          }
        });
        // go through parent folder tree and reduce it to a list
        return reduceParentFolderTreeToList(parentFolder);
      }
      return [parentFolder];
    });
  } catch (error) {
    throw error;
  }
}
