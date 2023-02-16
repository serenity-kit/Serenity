import { ForbiddenError, UserInputError } from "apollo-server-express";
import { prisma } from "../prisma";

type Params = {
  folderId: string;
  userId: string;
};

export async function getFolderTrace({ userId, folderId }: Params) {
  // return an array where the first element is the root folder
  // and the last element is the requested folder
  let folder = await prisma.folder.findUnique({
    where: {
      id: folderId,
    },
  });
  if (!folder) {
    throw new UserInputError("Invalid folderId");
  }
  const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
    where: {
      userId,
      workspaceId: folder.workspaceId,
    },
  });
  if (!userToWorkspace) {
    throw new ForbiddenError("Unauthorized");
  }
  // next let's build the folder tree up to this folder
  const folderTrace = [folder];
  while (folder && folder.parentFolderId) {
    folder = await prisma.folder.findUnique({
      where: {
        id: folder.parentFolderId,
      },
    });
    if (folder) {
      folderTrace.unshift(folder);
    }
  }
  return folderTrace;
}
