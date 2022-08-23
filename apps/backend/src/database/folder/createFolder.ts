import { ForbiddenError, UserInputError } from "apollo-server-express";
import { Folder } from "../../types/folder";
import { prisma } from "../prisma";

type Params = {
  userId: string;
  id: string;
  name?: string;
  encryptedName: string;
  encryptedNameNonce: string;
  subkeyId: number;
  parentFolderId?: string;
  workspaceId: string;
};

export async function createFolder({
  userId,
  id,
  name,
  encryptedName,
  encryptedNameNonce,
  subkeyId,
  parentFolderId,
  workspaceId,
}: Params) {
  let folderName = "Untitled";
  if (name) {
    folderName = name;
  }
  return await prisma.$transaction(async (prisma) => {
    const folderforId = await prisma.folder.findFirst({
      where: { id },
      select: { id: true },
    });
    if (folderforId) {
      throw new UserInputError("Invalid input: duplicate id");
    }
    // to prevent an internal server error
    // throw a bad user input on duplicate subkeyid
    const folderForSubkeyId = await prisma.folder.findFirst({
      where: { subkeyId, workspaceId },
      select: { id: true },
    });
    if (folderForSubkeyId) {
      throw new UserInputError("Invalid input: duplicate subKeyId");
    }
    // make sure we have permissions to do stuff with this workspace
    const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
      where: {
        userId,
        workspaceId,
      },
    });
    if (!userToWorkspace) {
      throw new ForbiddenError("Unauthorized");
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
        throw new ForbiddenError("Unauthorized");
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
        encryptedName,
        encryptedNameNonce,
        subkeyId,
        parentFolderId,
        rootFolderId,
        workspaceId,
      },
    });
    const folder: Folder = {
      ...rawFolder,
      parentFolders: [],
    };
    return folder;
  });
}
