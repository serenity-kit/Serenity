import { prisma } from "../prisma";

type Params = {
  id: string;
  username: string;
};
export async function getWorkspace({ username, id }: Params) {
  const workspace = await prisma.workspace.findUnique({
    include: { usersToWorkspaces: true },
    where: { id },
  });
  if (!workspace) {
    return null;
  }
  if (
    workspace.usersToWorkspaces.some(
      (connection) => connection.username === username
    )
  ) {
    return workspace;
  }
  return null;
}
