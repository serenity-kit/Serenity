import { prisma } from "../prisma";
import { Workspace, formatWorkspace } from "../../types/workspace";
import { ForbiddenError } from "apollo-server-express";

type Params = {
  workspaceInvitationId: string;
  userId: string;
};

export async function acceptWorkspaceInvitation({
  workspaceInvitationId,
  userId,
}: Params): Promise<Workspace> {
  return await prisma.$transaction(async (prisma) => {
    // try to find this workspace invitation id
    const currentTime = new Date();
    const workspaceInvitation = await prisma.workspaceInvitations.findFirst({
      where: {
        id: workspaceInvitationId,
        expiresAt: {
          gt: currentTime,
        },
      },
    });
    if (!workspaceInvitation) {
      throw new ForbiddenError("Unauthorized");
    }
    const workspaceId = workspaceInvitation.workspaceId;
    // check if this user already has access to this workspace
    const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
      where: {
        userId,
        workspaceId,
      },
      select: {
        workspace: {
          select: {
            id: true,
            idSignature: true,
            name: true,
            usersToWorkspaces: {
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
        },
      },
    });
    // if they do, return the workspace
    if (userToWorkspace) {
      const workspace = formatWorkspace(userToWorkspace.workspace);
      return workspace;
    } else {
      // if they don't, create a new user to workspace relationship
      await prisma.usersToWorkspaces.create({
        data: {
          userId,
          workspaceId,
          isAdmin: false,
        },
      });
      // and return the workspace
      const connectedWorkspace = await prisma.workspace.findFirst({
        where: {
          id: workspaceId,
        },
        select: {
          id: true,
          idSignature: true,
          name: true,
          usersToWorkspaces: {
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
      const workspace = formatWorkspace(connectedWorkspace);
      return workspace;
    }
  });
}
