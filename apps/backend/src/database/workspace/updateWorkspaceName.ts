import { ForbiddenError } from "apollo-server-express";
import { Role } from "../../../prisma/generated/output";
import { formatWorkspace, Workspace } from "../../types/workspace";
import { prisma } from "../prisma";

export type WorkspaceMemberParams = {
  userId: string;
  role: Role;
};

type Params = {
  id: string;
  name: string | undefined;
  userId: string;
};

type UserToWorkspaceData = {
  userId: string;
  workspaceId: string;
  role: Role;
};

export async function updateWorkspaceName({
  id,
  name,
  userId,
}: Params): Promise<Workspace> {
  return await prisma.$transaction(async (prisma) => {
    const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
      where: {
        userId,
        role: Role.ADMIN,
        workspaceId: id,
      },
      select: {
        workspaceId: true,
        role: true,
      },
    });
    if (!userToWorkspace || !userToWorkspace.role) {
      throw new ForbiddenError("Unauthorized");
    }
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: userToWorkspace.workspaceId,
      },
      select: { id: true },
    });
    if (!workspace) {
      throw new Error("Invalid workspaceId");
    }
    let updatedWorkspace: any;
    if (name != undefined) {
      updatedWorkspace = await prisma.workspace.update({
        where: {
          id: workspace.id,
        },
        // TODO: update IDs
        data: {
          name: name,
          idSignature: "TODO",
        },
        include: { usersToWorkspaces: { include: { user: true } } },
      });
    } else {
      updatedWorkspace = workspace;
      updatedWorkspace = await prisma.workspace.findFirst({
        where: {
          id: workspace.id,
        },
        include: { usersToWorkspaces: { include: { user: true } } },
      });
    }
    return formatWorkspace(updatedWorkspace);
  });
}
