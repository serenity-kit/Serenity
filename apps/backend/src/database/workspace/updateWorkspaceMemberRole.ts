import * as workspaceChain from "@serenity-kit/workspace-chain";
import { ForbiddenError } from "apollo-server-express";
import { Role } from "../../../prisma/generated/output";
import { formatWorkspace, Workspace } from "../../types/workspace";
import { prisma } from "../prisma";

type Params = {
  workspaceId: string;
  userId: string;
  workspaceChainEvent: workspaceChain.UpdateMemberWorkspaceChainEvent;
};

export async function updateWorkspaceMemberRole({
  workspaceId,
  userId,
  workspaceChainEvent,
}: Params): Promise<Workspace> {
  return await prisma.$transaction(async (prisma) => {
    // 1. retrieve workspace if owned by user
    // 2. update usersToWorkspaces with new member structures
    const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
      where: {
        userId,
        role: Role.ADMIN,
        workspaceId,
      },
      select: {
        workspaceId: true,
        role: true,
      },
    });
    if (!userToWorkspace || !userToWorkspace.role) {
      throw new ForbiddenError("Unauthorized");
    }

    // TODO refactor to utility function
    const prevWorkspaceChainEvent =
      await prisma.workspaceChainEvent.findFirstOrThrow({
        where: { workspaceId },
        orderBy: { position: "desc" },
      });
    const prevState = workspaceChain.WorkspaceChainState.parse(
      prevWorkspaceChainEvent.state
    );

    const newState = workspaceChain.applyEvent(prevState, workspaceChainEvent);
    await prisma.workspaceChainEvent.create({
      data: {
        content: workspaceChainEvent,
        state: newState,
        workspaceId,
        position: prevWorkspaceChainEvent.position + 1,
      },
    });

    const user = await prisma.user.findUniqueOrThrow({
      where: {
        mainDeviceSigningPublicKey:
          workspaceChainEvent.transaction.memberMainDeviceSigningPublicKey,
      },
    });

    await prisma.usersToWorkspaces.update({
      where: {
        userId_workspaceId: {
          workspaceId,
          userId: user.id,
        },
      },
      data: { role: workspaceChainEvent.transaction.role },
    });
    const updatedWorkspace = await prisma.workspace.findFirstOrThrow({
      where: { id: workspaceId },
      include: {
        usersToWorkspaces: {
          include: {
            user: {
              select: {
                username: true,
                mainDeviceSigningPublicKey: true,
                devices: {
                  select: {
                    signingPublicKey: true,
                    encryptionPublicKey: true,
                    encryptionPublicKeySignature: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return formatWorkspace(updatedWorkspace);
  });
}
