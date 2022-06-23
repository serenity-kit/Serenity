import { prisma } from "../prisma";
import { Workspace, WorkspaceMember } from "../../types/workspace";

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
      select: {
        userId: true,
        isAdmin: true,
        user: {
          select: {
            username: true,
          },
        },
      },
    });
    const members: WorkspaceMember[] = [];
    usersToWorkspaces.forEach((userToWorkspace) => {
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
      members,
    };

    // TODO: insert a snapshot that includes basic title and text content to document
    return workspace;
  });
}
