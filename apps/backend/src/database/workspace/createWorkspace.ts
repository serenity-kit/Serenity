import { prisma } from "../prisma";
import { Workspace } from "../../types/workspace";

type Params = {
  id: string;
  name: string;
  userId: string;
};

export async function createWorkspace({
  id,
  name,
  userId,
}: Params): Promise<Workspace> {
  return await prisma.$transaction(async (prisma) => {
    const rawWorkspace = await prisma.workspace.create({
      data: {
        id,
        idSignature: "TODO",
        name,
        usersToWorkspaces: {
          create: {
            userId,
            isAdmin: true,
          },
        },
      },
    });
    const usersToWorkspaces = await prisma.usersToWorkspaces.findMany({
      where: {
        workspaceId: rawWorkspace.id,
        userId,
      },
    });
    const workspace: Workspace = {
      id: rawWorkspace.id,
      name: rawWorkspace.name,
      idSignature: rawWorkspace.idSignature,
      members: usersToWorkspaces,
    };
    return workspace;
  });
}
