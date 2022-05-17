import { Folder } from "../../types/folder";
import { prisma } from "../prisma";

type DeleteFolderParams = {
  folderIds: string[];
  username: string;
};

type ChildFolderParams = {
  folder: Folder;
};

const getDeletableFoldersFromChildren = ({ folder }: ChildFolderParams) => {
  const deletableFolderIds: string[] = [folder.id];
  const childFolderIds = Object.keys(folder["childFoldersLookup"]);
  childFolderIds.forEach((childFolderId) => {
    if (!deletableFolderIds.includes(childFolderId)) {
      deletableFolderIds.push(childFolderId);
      const childFolder = folder["childFoldersLookup"][childFolderId];
      deletableFolderIds.concat(
        getDeletableFoldersFromChildren({
          folder: childFolder,
        })
      );
    }
  });
  return deletableFolderIds;
};

export async function deleteFolders({
  folderIds,
  username,
}: DeleteFolderParams) {
  try {
    return await prisma.$transaction(async (prisma) => {
      // 1. fetch all folders
      // 2. get workspace IDs from each folder, create a lookup
      // 3. grab workspaces where user is an admin
      // 4. finally, delete folders where the workspace ids match
      /*
      // then, prune folders by matching workspaces
      // find the root folders
      // find all folders with the same root folder
      // find all that are children of the deleting folder
      // delete folders that survived the pruning and are children
      // delete documents that have that folder
      /* */

      // 1. Fetch all folders
      const requestedFolders = await prisma.folder.findMany({
        where: {
          id: {
            in: folderIds,
          },
        },
      });

      // 2. Get workspace IDs from each folder, create a lookup
      const workspaceFolderLookup = {};
      const rootFolderIds: string[] = [];
      requestedFolders.forEach((requestedFolder) => {
        const workspaceId = requestedFolder.workspaceId;
        if (!(requestedFolder.workspaceId in workspaceFolderLookup)) {
          workspaceFolderLookup[workspaceId] = [];
        }
        workspaceFolderLookup[workspaceId].push(requestedFolder);
        if (requestedFolder.rootFolderId) {
          rootFolderIds.push(requestedFolder.rootFolderId);
        } else {
          rootFolderIds.push(requestedFolder.id);
        }
      });
      const requestedWorkspaceIds = Object.keys(workspaceFolderLookup);

      // 3. Grab workspaces where user is an admin
      const validWorkspaces = await prisma.usersToWorkspaces.findMany({
        where: {
          username,
          isAdmin: true,
          workspaceId: {
            in: requestedWorkspaceIds,
          },
        },
      });
      const validWorkspaceIds: string[] = [];
      validWorkspaces.forEach((validWorkspace) => {
        validWorkspaceIds.push(validWorkspace.workspaceId);
      });

      // 4. Finally, delete all folders where the the user is an admin
      // of the workspace
      // the database cascade should handle the rest
      await prisma.folder.deleteMany({
        where: {
          id: {
            in: folderIds,
          },
          workspaceId: {
            in: validWorkspaceIds,
          },
        },
      });

      /*
      // 4. Then, prune folders by matching workspaces
      // fetch all folders related to the roots, so we can delete
      // entire trees
      const relatedFolders = await prisma.folder.findMany({
        where: {
          rootFolderId: {
            in: rootFolderIds,
          }, // or id in rootFolderIds
          workspaceId: {
            in: validWorkspaceIds,
          },
        },
      });
      // now build the tree, and keep track of the deletion point
      // of each branch
      // first step: create a lookup table
      const relatedFolderLookup = {};
      const relatedFolderRootLookup = {};
      const deleteFromFolderIds: string[] = [];
      relatedFolders.forEach((folder) => {
        // add a "children" property to the folder
        folder["childFoldersLookup"] = {};
        const folderId = folder.id;
        if (!folder.rootFolderId) {
          relatedFolderRootLookup[folderId] = folder;
        }
        relatedFolderLookup[folderId] = folder;
        if (folderId in folderIds) {
          deleteFromFolderIds.push(folderId);
        }
      });
      // second step: build the tree
      relatedFolders.forEach((folder) => {
        const parentFolderId = folder.parentFolderId;
        if (parentFolderId) {
          const parentFolder = relatedFolderRootLookup[parentFolderId];
          parentFolder.childFoldersLookup[folder.id] = folder;
        }
      });

      // step three, starting from the deletion root of each tree,
      // collect all the child folders
      const allDeletableFolderIds: string[] = [];
      deleteFromFolderIds.forEach((deletableFolderId) => {
        // recursively check it's children for children
        const folder = relatedFolderLookup[deletableFolderId];
        allDeletableFolderIds.concat(
          getDeletableFoldersFromChildren({ folder })
        );
      });

      // delete documents belonging to these folders
      await prisma.document.deleteMany({
        where: {
          parentFolderId: {
            in: allDeletableFolderIds,
          },
        },
      });
      // delete folders with these ids
      await prisma.folder.deleteMany({
        where: {
          id: {
            in: allDeletableFolderIds,
          },
        },
      });
      /* */
    });
  } catch (error) {
    console.log("ERROR");
    console.log(error);
    throw Error("Invalid folder IDs");
  }
}
