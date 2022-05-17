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

export async function getFolder({ username, id }: Params) {
  try {
    return await prisma.$transaction(async (prisma) => {
      // make sure the user has access to the workspace
      // by retrieving and verifying the workspace
      const folder = await prisma.folder.findUnique({
        where: {
          id,
        },
      });
      if (!folder) {
        throw Error("Folder not found");
      }
      const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
        where: {
          username,
          workspaceId: folder.workspaceId,
        },
      });
      if (!userToWorkspace) {
        throw Error("Unauthorized");
      }

      // next let's build the folder tree up to this folder
      if (folder.rootFolderId) {
        const relatedFolders = await prisma.folder.findMany({
          where: {
            id: {
              in: [folder.rootFolderId],
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
        folder["parentFolders"] = reduceParentFolderTreeToList(
          folder["parentFolder"]
        );
      }
      return folder;
    });
  } catch (error) {
    throw error;
  }
}
