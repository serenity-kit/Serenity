import { prisma } from "../prisma";

type DeleteFolderParams = {
  folderIds: string[];
  username: string;
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
    });
  } catch (error) {
    console.log("ERROR");
    console.log(error);
    throw Error("Invalid folder IDs");
  }
}
