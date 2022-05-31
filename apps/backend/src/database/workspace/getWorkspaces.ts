import { prisma } from "../prisma";
import { Workspace, WorkspaceMember } from "../../types/workspace";

type Cursor = {
  id?: string;
};

type Params = {
  userId: string;
  cursor?: Cursor;
  skip?: number;
  take: number;
};
export async function getWorkspaces({ userId, cursor, skip, take }: Params) {
  const userToWorkspaces = await prisma.usersToWorkspaces.findMany({
    where: {
      userId,
    },
  });
  const rawWorkspaces = await prisma.workspace.findMany({
    where: {
      id: {
        in: userToWorkspaces.map((u) => u.workspaceId),
      },
    },
    cursor,
    skip,
    take,
    orderBy: {
      name: "asc",
    },
    include: {
      usersToWorkspaces: {
        orderBy: {
          userId: "asc",
        },
        select: {
          userId: true,
          isAdmin: true,
          user: {
            select: {
              username: true,
            },
          },
        },
      },
    },
  });
  // attach the .usersToWorkspaces as .members property
  // these lines convert the prisma types to the graphql types
  const workspaces: Workspace[] = [];
  rawWorkspaces.forEach((rawWorkspace) => {
    const members: WorkspaceMember[] = [];
    rawWorkspace.usersToWorkspaces.forEach((userToWorkspace) => {
      members.push({
        userId: userToWorkspace.userId,
        username: userToWorkspace.user.username,
        isAdmin: userToWorkspace.isAdmin,
      });
    });
    const workspace: Workspace = {
      id: rawWorkspace.id,
      name: rawWorkspace.name,
      idSignature: rawWorkspace.idSignature,
      members: members,
    };
    workspaces.push(workspace);
  });
  return workspaces;
}
