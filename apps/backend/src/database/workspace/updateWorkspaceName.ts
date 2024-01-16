import { ForbiddenError } from "apollo-server-express";
import { Prisma, Role } from "../../../prisma/generated/output";
import { formatWorkspace } from "../../types/workspace";
import { getOrCreateCreatorDevice } from "../../utils/device/getOrCreateCreatorDevice";
import { prisma } from "../prisma";

type Params = {
  id: string;
  infoCiphertext: string;
  infoNonce: string;
  infoSignature: string;
  infoWorkspaceKeyId: string;
  authorDeviceSigningPublicKey: string;
  userId: string;
};

export async function updateWorkspaceName({
  id,
  infoCiphertext,
  infoNonce,
  infoSignature,
  infoWorkspaceKeyId,
  authorDeviceSigningPublicKey,
  userId,
}: Params) {
  return await prisma.$transaction(
    async (prisma) => {
      const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
        where: {
          userId,
          role: Role.ADMIN,
          workspaceId: id,
        },
        select: {
          workspaceId: true,
          role: true,
        },
      });
      if (!userToWorkspace || !userToWorkspace.role) {
        throw new ForbiddenError("Unauthorized");
      }
      const workspace = await prisma.workspace.findFirst({
        where: {
          id: userToWorkspace.workspaceId,
        },
        select: { id: true },
      });
      if (!workspace) {
        throw new Error("Invalid workspaceId");
      }

      // convert the user's device into a creatorDevice
      await getOrCreateCreatorDevice({
        prisma,
        userId,
        signingPublicKey: authorDeviceSigningPublicKey,
      });

      let updatedWorkspace: any;
      updatedWorkspace = await prisma.workspace.update({
        where: {
          id: workspace.id,
        },
        data: {
          infoCiphertext,
          infoNonce,
          infoSignature,
          infoWorkspaceKeyId,
          infoCreatorDeviceSigningPublicKey: authorDeviceSigningPublicKey,
        },
      });
      return formatWorkspace(updatedWorkspace);
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );
}
