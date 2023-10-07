import { KeyDerivationTrace } from "@serenity-tools/common";
import { ForbiddenError, UserInputError } from "apollo-server-express";
import { Prisma, Role } from "../../../prisma/generated/output";
import { Folder } from "../../types/folder";
import { prisma } from "../prisma";

type Params = {
  userId: string;
  id: string;
  nameCiphertext: string;
  nameNonce: string;
  workspaceKeyId: string;
  subkeyId: number;
  parentFolderId?: string;
  workspaceId: string;
  keyDerivationTrace: KeyDerivationTrace;
};

export async function createFolder({
  userId,
  id,
  nameCiphertext,
  nameNonce,
  workspaceKeyId,
  subkeyId,
  parentFolderId,
  workspaceId,
  keyDerivationTrace,
}: Params) {
  const allowedRoles = [Role.ADMIN, Role.EDITOR];
  return await prisma.$transaction(
    async (prisma) => {
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
        throw new UserInputError("Invalid input: duplicate subkeyId");
      }
      // make sure we have permissions to do stuff with this workspace
      const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
        where: {
          userId,
          workspaceId,
          role: { in: allowedRoles },
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
          nameCiphertext,
          nameNonce,
          workspaceKeyId,
          subkeyId,
          parentFolderId,
          rootFolderId,
          workspaceId,
          keyDerivationTrace,
        },
      });
      const folder: Folder = {
        ...rawFolder,
        keyDerivationTrace: rawFolder.keyDerivationTrace as KeyDerivationTrace,
        parentFolders: [],
      };
      return folder;
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );
}
