import { prisma } from "../prisma";

type Params = {
  id: string;
  userId: string;
};
export async function getWorkspace({ userId, id }: Params) {
  // include userstoworkspaces but in descending alphabetical order by userId
  const workspace = await prisma.workspace.findUnique({
    include: {
      usersToWorkspaces: {
        orderBy: {
          userId: "desc",
        },
      },
    },
    where: { id },
  });
  if (!workspace) {
    return null;
  }
  if (
    workspace.usersToWorkspaces.some(
      (connection) => connection.userId === userId
    )
  ) {
    return workspace;
  }
  return null;
}
