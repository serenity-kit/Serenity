import { ForbiddenError } from "apollo-server-express";
import { Prisma, Role } from "../../../prisma/generated/output";
import { prisma } from "../prisma";

type DeleteFolderParams = {
  folderIds: string[];
  workspaceId: string;
  userId: string;
};

export async function deleteFolders({
  folderIds,
  workspaceId,
  userId,
}: DeleteFolderParams) {
  const allowedRoles = [Role.ADMIN, Role.EDITOR];
  return await prisma.$transaction(
    async (prisma) => {
      const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
        where: { userId, workspaceId, role: { in: allowedRoles } },
      });
      if (!userToWorkspace) {
        throw new ForbiddenError("Unauthorized");
      }
      await prisma.folder.deleteMany({
        where: {
          id: { in: folderIds },
          workspaceId,
        },
      });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );
}
