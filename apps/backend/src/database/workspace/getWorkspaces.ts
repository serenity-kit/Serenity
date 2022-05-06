import { prisma } from "../prisma";
import { Workspace } from "../../graphql/types/workspace";

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
  const rawWorkspaces = await prisma.workspace.findMany({
    where: {
      usersToWorkspaces: {
        every: {
          username: username,
        },
      },
    },
    cursor,
    skip,
    take,
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      idSignature: true,
      usersToWorkspaces: {
        select: {
          username: true,
          isAdmin: true,
        },
      },
    },
  });
  // attach the .usersToWorkspaces as .members property
  const workspaces: any = [];
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
