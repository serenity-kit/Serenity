import { prisma } from "../prisma";

type Params = {
  workspaceIds: string[];
  username: string;
};

export async function deleteWorkspaces({ workspaceIds, username }: Params) {
  try {
    await prisma.$transaction(async (prisma) => {
      // TODO: delete usersToWorkspace?
      // can only delete workspaces where the user is the admin
      const userWorkspaces = await prisma.usersToWorkspaces.findMany({
        where: {
          username: username,
          isAdmin: true,
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
    });
  } catch (error) {
    throw Error("Invalid workspace IDs");
  }
}
