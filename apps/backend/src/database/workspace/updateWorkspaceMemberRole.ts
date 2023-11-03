import * as workspaceChain from "@serenity-kit/workspace-chain";
import { ForbiddenError } from "apollo-server-express";
import { Prisma, Role } from "../../../prisma/generated/output";
import { Workspace, formatWorkspace } from "../../types/workspace";
import { prisma } from "../prisma";
import { getLastWorkspaceChainEventWithState } from "../workspaceChain/getLastWorkspaceChainEventWithState";

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
  return await prisma.$transaction(
    async (prisma) => {
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

      const { lastWorkspaceChainEvent, workspaceChainState } =
        await getLastWorkspaceChainEventWithState({ prisma, workspaceId });

      const newState = workspaceChain.applyEvent(
        workspaceChainState,
        workspaceChainEvent
      );
      await prisma.workspaceChainEvent.create({
        data: {
          content: workspaceChainEvent,
          state: newState,
          workspaceId,
          position: lastWorkspaceChainEvent.position + 1,
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
      });
      return formatWorkspace(updatedWorkspace);
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );
}
