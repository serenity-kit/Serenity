import { ForbiddenError } from "apollo-server-express";
import { Prisma, Role } from "../../../prisma/generated/output";
import { getOrCreateCreatorDevice } from "../../utils/device/getOrCreateCreatorDevice";
import { prisma } from "../prisma";
import { getWorkspaceMemberDevicesProof } from "../workspace/getWorkspaceMemberDevicesProof";

type Params = {
  id: string;
  nameCiphertext: string;
  nameNonce: string;
  nameSignature: string;
  nameWorkspaceMemberDevicesProofHash: string;
  nameCreatorDeviceSigningPublicKey: string;
  workspaceKeyId: string;
  subkeyId: string;
  userId: string;
};

export async function updateDocumentName({
  id,
  nameCiphertext,
  nameNonce,
  nameSignature,
  nameWorkspaceMemberDevicesProofHash,
  nameCreatorDeviceSigningPublicKey,
  workspaceKeyId,
  subkeyId,
  userId,
}: Params) {
  const allowedRoles = [Role.ADMIN, Role.EDITOR];
  try {
    return await prisma.$transaction(
      async (prisma) => {
        const document = await prisma.document.findFirst({
          where: {
            id,
          },
        });
        if (!document) {
          throw new ForbiddenError("Unauthorized");
        }
        const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
          where: {
            userId,
            workspaceId: document.workspaceId,
            role: { in: allowedRoles },
          },
        });
        if (
          !userToWorkspace ||
          document.workspaceId !== userToWorkspace.workspaceId
        ) {
          throw new ForbiddenError("Unauthorized");
        }

        const workspaceMemberDevicesProof =
          await getWorkspaceMemberDevicesProof({
            workspaceId: document.workspaceId,
            userId,
            prisma,
          });
        if (
          workspaceMemberDevicesProof.proof.hash !==
          nameWorkspaceMemberDevicesProofHash
        ) {
          throw new Error(
            "Outdated workspace member devices proof hash for updating the document name"
          );
        }

        // convert the user's device into a creatorDevice
        const creatorDevice = await getOrCreateCreatorDevice({
          prisma,
          userId,
          signingPublicKey: nameCreatorDeviceSigningPublicKey,
        });

        const updatedDocument = await prisma.document.update({
          where: { id },
          data: {
            nameCiphertext,
            nameNonce,
            nameSignature,
            nameWorkspaceMemberDevicesProofHash,
            nameCreatorDeviceSigningPublicKey: creatorDevice.signingPublicKey,
            workspaceKeyId,
            subkeyId,
          },
        });
        return updatedDocument;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );
  } catch (error) {
    throw error;
  }
}
