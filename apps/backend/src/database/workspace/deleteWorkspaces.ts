import { Prisma, Role } from "../../../prisma/generated/output";
import { prisma } from "../prisma";

type Params = {
  workspaceIds: string[];
  userId: string;
};

export async function deleteWorkspaces({ workspaceIds, userId }: Params) {
  try {
    await prisma.$transaction(
      async (prisma) => {
        // TODO: delete usersToWorkspace?
        // can only delete workspaces where the user is the admin
        const userWorkspaces = await prisma.usersToWorkspaces.findMany({
          where: {
            userId: userId,
            role: Role.ADMIN,
            workspaceId: {
              in: workspaceIds,
            },
          },
        });
        let userWorkspaceIds: string[] = [];
        for (const userWorkspace of userWorkspaces) {
          userWorkspaceIds.push(userWorkspace.workspaceId);
        }
        await prisma.usersToWorkspaces.deleteMany({
          where: {
            workspaceId: {
              in: userWorkspaceIds,
            },
          },
        });
        await prisma.workspace.deleteMany({
          where: {
            id: {
              in: userWorkspaceIds,
            },
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );
  } catch (error) {
    throw new Error("Invalid workspaceIds");
  }
}
