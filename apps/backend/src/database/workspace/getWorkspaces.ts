import { prisma } from "../prisma";
import { Workspace } from "../../types/workspace";

type Cursor = {
  id?: string;
};

type Params = {
  username: string;
  cursor?: Cursor;
  skip?: number;
  take: number;
};
export async function getWorkspaces({ username, cursor, skip, take }: Params) {
  const userToWorkspaces = await prisma.usersToWorkspaces.findMany({
    where: {
      username,
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
    include: { usersToWorkspaces: true },
  });
  // attach the .usersToWorkspaces as .members property
  const workspaces: Workspace[] = [];
  rawWorkspaces.forEach((rawWorkspace) => {
    const workspace = {
      id: rawWorkspace.id,
      name: rawWorkspace.name,
      idSignature: rawWorkspace.idSignature,
      members: rawWorkspace.usersToWorkspaces,
    };
    workspaces.push(workspace);
  });
  return workspaces;
}
