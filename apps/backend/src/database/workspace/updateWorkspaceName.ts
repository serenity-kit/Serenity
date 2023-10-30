import { ForbiddenError } from "apollo-server-express";
import { Prisma, Role } from "../../../prisma/generated/output";
import { formatWorkspace } from "../../types/workspace";
import { prisma } from "../prisma";

type Params = {
  id: string;
  infoCiphertext: string;
  infoNonce: string;
  infoWorkspaceKeyId: string;
  userId: string;
};

export async function updateWorkspaceName({
  id,
  infoCiphertext,
  infoNonce,
  infoWorkspaceKeyId,
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
      let updatedWorkspace: any;
      updatedWorkspace = await prisma.workspace.update({
        where: {
          id: workspace.id,
        },
        data: {
          infoCiphertext,
          infoNonce,
          infoWorkspaceKeyId,
        },
      });
      return formatWorkspace(updatedWorkspace);
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );
}
