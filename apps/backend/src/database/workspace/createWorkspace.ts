import { prisma } from "../prisma";
import { Workspace, WorkspaceMember } from "../../types/workspace";

type InitialStructureParams = {
  workspaceId: string;
};

export async function createInitialDocumentFolderStructure({
  workspaceId,
}: InitialStructureParams) {
  const folder = await prisma.folder.create({
    data: {
      id: "TODO",
      name: "Getting started",
      workspaceId,
      idSignature: "TODO",
    },
  });
  const document = await prisma.document.create({
    data: {
      id: "TODO",
      name: "Introduction",
      parentFolderId: folder.id,
      workspaceId,
    },
  });
  // TODO: build document snapshot and data from template
  return {
    folder,
    document,
  };
}

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
    // if this is the first workspace,
    // then we will also want to create a folder and document
    const existingWorkspaces = prisma.usersToWorkspaces.findFirst({
      where: {
        userId,
        isAdmin: true,
      },
    });
    let isFirstWorkspace = false;
    if (!existingWorkspaces) {
      isFirstWorkspace = true;
    }
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
    if (isFirstWorkspace) {
      createInitialDocumentFolderStructure({ workspaceId: workspace.id });
    }
    return workspace;
  });
}
