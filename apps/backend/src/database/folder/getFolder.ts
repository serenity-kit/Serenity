import { ForbiddenError } from "apollo-server-express";
import { Prisma } from "../../../prisma/generated/output";
import { Folder, formatFolder } from "../../types/folder";
import { prisma } from "../prisma";

type Params = {
  id: string;
  userId: string;
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
  return await prisma.$transaction(
    async (prisma) => {
      // make sure the user has access to the workspace
      // by retrieving and verifying the workspace
      const rawFolder = await prisma.folder.findUnique({
        where: {
          id,
        },
      });
      if (!rawFolder) {
        throw new ForbiddenError("Unauthorized");
      }
      const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
        where: {
          userId,
          workspaceId: rawFolder.workspaceId,
        },
      });
      if (!userToWorkspace) {
        throw new ForbiddenError("Unauthorized");
      }
      // next let's build the folder tree up to this folder
      const folder = formatFolder(rawFolder);
      folder.parentFolders = [];
      if (rawFolder.rootFolderId) {
        const relatedFolders = await prisma.folder.findMany({
          where: {
            rootFolderId: {
              in: [rawFolder.rootFolderId],
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });
        const rootFolder = await prisma.folder.findUniqueOrThrow({
          where: {
            id: rawFolder.rootFolderId,
          },
        });

        const treeFolderLookup = {
          [rawFolder.rootFolderId]: formatFolder(rootFolder),
        };
        relatedFolders.forEach((relatedFolder) => {
          treeFolderLookup[relatedFolder.id] = formatFolder(relatedFolder);
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
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );
}
