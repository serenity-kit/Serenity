import {
  KeyDerivationTrace,
  verifyFolderNameSignature,
} from "@serenity-tools/common";
import { ForbiddenError, UserInputError } from "apollo-server-express";
import { Prisma, Role } from "../../../prisma/generated/output";
import { getOrCreateCreatorDevice } from "../../utils/device/getOrCreateCreatorDevice";
import { prisma } from "../prisma";
import { getWorkspaceMemberDevicesProof } from "../workspace/getWorkspaceMemberDevicesProof";

type Params = {
  id: string;
  nameCiphertext: string;
  nameNonce: string;
  signature: string;
  workspaceMemberDevicesProofHash: string;
  workspaceKeyId: string;
  subkeyId: string;
  userId: string;
  keyDerivationTrace: KeyDerivationTrace;
  sessionDeviceSigningPublicKey: string;
  userMainDeviceSigningPublicKey: string;
};

export async function updateFolderName({
  id,
  nameCiphertext,
  nameNonce,
  workspaceKeyId,
  signature,
  workspaceMemberDevicesProofHash,
  subkeyId,
  userId,
  keyDerivationTrace,
  sessionDeviceSigningPublicKey,
  userMainDeviceSigningPublicKey,
}: Params) {
  const allowedRoles = [Role.ADMIN, Role.EDITOR];
  return await prisma.$transaction(
    async (prisma) => {
      const folderWithSubkeyId = await prisma.folder.findFirst({
        where: { subkeyId, id: { not: id } },
        select: { id: true },
      });
      if (folderWithSubkeyId) {
        throw new UserInputError("Invalid input: duplicate subkeyId");
      }
      // fetch the folder
      // validate the signature and identify the device that updated the folder name
      // check if the user has access to the workspace
      // update the folder
      const folder = await prisma.folder.findFirst({
        where: {
          id,
        },
      });
      if (!folder) {
        throw new ForbiddenError("Unauthorized");
      }

      const workspaceMemberDevicesProof = await getWorkspaceMemberDevicesProof({
        workspaceId: folder.workspaceId,
        userId,
      });

      let authorDeviceSigningPublicKey = sessionDeviceSigningPublicKey;
      const validSignature = verifyFolderNameSignature({
        ciphertext: nameCiphertext,
        nonce: nameNonce,
        signature,
        authorSigningPublicKey: sessionDeviceSigningPublicKey,
        folderId: id,
        workspaceId: folder.workspaceId,
        workspaceMemberDevicesProof: workspaceMemberDevicesProof.proof,
        keyDerivationTrace,
      });

      if (!validSignature) {
        const validSignatureForMainDevice = verifyFolderNameSignature({
          ciphertext: nameCiphertext,
          nonce: nameNonce,
          signature,
          authorSigningPublicKey: userMainDeviceSigningPublicKey,
          folderId: id,
          workspaceId: folder.workspaceId,
          workspaceMemberDevicesProof: workspaceMemberDevicesProof.proof,
          keyDerivationTrace,
        });
        if (validSignatureForMainDevice) {
          authorDeviceSigningPublicKey = userMainDeviceSigningPublicKey;
        } else {
          throw new Error("Invalid signature");
        }
      }

      const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
        where: {
          userId,
          workspaceId: folder.workspaceId,
          role: { in: allowedRoles },
        },
      });
      if (
        !userToWorkspace ||
        folder.workspaceId !== userToWorkspace.workspaceId
      ) {
        throw new ForbiddenError("Unauthorized");
      }

      // convert the user's device into a creatorDevice to make sure it's available
      // further down when the folder is updated
      await getOrCreateCreatorDevice({
        prisma,
        userId,
        signingPublicKey: authorDeviceSigningPublicKey,
      });

      const updatedFolder = await prisma.folder.update({
        where: {
          id,
        },
        data: {
          nameCiphertext,
          nameNonce,
          signature,
          workspaceMemberDevicesProofHash,
          workspaceKeyId,
          subkeyId,
          keyDerivationTrace,
          creatorDeviceSigningPublicKey: authorDeviceSigningPublicKey,
        },
      });
      return updatedFolder;
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );
}
