import { Workspace, WorkspaceMember } from "../../types/workspace";
import { prisma } from "../prisma";

type Params = {
  id: string;
  userId: string;
};
export async function getWorkspace({ userId, id }: Params) {
  // include userstoworkspaces but in descending alphabetical order by userId
  const rawWorkspace = await prisma.workspace.findUnique({
    include: {
      usersToWorkspaces: {
        orderBy: {
          userId: "desc",
        },
        include: {
          user: {
            select: {
              username: true,
            },
          },
        },
      },
    },
    where: { id },
  });
  if (!rawWorkspace) {
    return null;
  }
  if (
    rawWorkspace.usersToWorkspaces.some(
      (connection) => connection.userId === userId
    )
  ) {
    const workspaceMembers: WorkspaceMember[] = [];
    rawWorkspace.usersToWorkspaces.forEach((userToWorkspace) => {
      const workspaceMember: WorkspaceMember = {
        userId: userToWorkspace.userId,
        username: userToWorkspace.user.username,
        isAdmin: userToWorkspace.isAdmin,
      };
      workspaceMembers.push(workspaceMember);
    });
    const workspace: Workspace = {
      id: rawWorkspace.id,
      name: rawWorkspace.name,
      idSignature: rawWorkspace.idSignature,
      members: workspaceMembers,
    };
    return workspace;
  }
  return null;
}
