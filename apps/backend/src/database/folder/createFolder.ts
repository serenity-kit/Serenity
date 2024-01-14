import { KeyDerivationTrace } from "@serenity-tools/common";
import { ForbiddenError, UserInputError } from "apollo-server-express";
import { Prisma, Role } from "../../../prisma/generated/output";
import { Folder } from "../../types/folder";
import { getOrCreateCreatorDevice } from "../../utils/device/getOrCreateCreatorDevice";
import { prisma } from "../prisma";

type Params = {
  userId: string;
  id: string;
  nameCiphertext: string;
  nameNonce: string;
  signature: string;
  workspaceMemberDevicesProofHash: string;
  workspaceKeyId: string;
  subkeyId: string;
  parentFolderId?: string;
  workspaceId: string;
  keyDerivationTrace: KeyDerivationTrace;
  authorDeviceSigningPublicKey: string;
};

export async function createFolder({
  userId,
  id,
  nameCiphertext,
  nameNonce,
  signature,
  workspaceMemberDevicesProofHash,
  workspaceKeyId,
  subkeyId,
  parentFolderId,
  workspaceId,
  keyDerivationTrace,
  authorDeviceSigningPublicKey,
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

      // convert the user's device into a creatorDevice
      const creatorDevice = await getOrCreateCreatorDevice({
        prisma,
        userId,
        signingPublicKey: authorDeviceSigningPublicKey,
      });

      const rawFolder = await prisma.folder.create({
        data: {
          id,
          signature,
          nameCiphertext,
          nameNonce,
          workspaceMemberDevicesProofHash,
          workspaceKeyId,
          subkeyId,
          parentFolderId,
          rootFolderId,
          workspaceId,
          keyDerivationTrace,
          creatorDeviceSigningPublicKey: creatorDevice.signingPublicKey,
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
