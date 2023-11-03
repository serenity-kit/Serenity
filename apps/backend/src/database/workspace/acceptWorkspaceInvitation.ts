import * as workspaceChain from "@serenity-kit/workspace-chain";
import { ForbiddenError } from "apollo-server-express";
import { Prisma } from "../../../prisma/generated/output";
import { prisma } from "../prisma";
import { getLastWorkspaceChainEventWithState } from "../workspaceChain/getLastWorkspaceChainEventWithState";

type Params = {
  workspaceChainEvent: workspaceChain.AcceptInvitationWorkspaceChainEvent;
  currentUserId: string;
};

export async function acceptWorkspaceInvitation({
  workspaceChainEvent,
  currentUserId,
}: Params): Promise<string> {
  return await prisma.$transaction(
    async (prisma) => {
      // try to find this workspace invitation id
      const invitationId = workspaceChainEvent.transaction.invitationId;
      const currentTime = new Date();
      const workspaceInvitation = await prisma.workspaceInvitations.findFirst({
        where: {
          id: invitationId,
          expiresAt: {
            gt: currentTime,
          },
        },
      });
      if (!workspaceInvitation) {
        throw new ForbiddenError("Unauthorized");
      }

      if (
        workspaceInvitation.workspaceId !==
        workspaceChainEvent.transaction.workspaceId
      ) {
        throw new Error("WorkspaceIds don't match");
      }

      const workspaceId = workspaceInvitation.workspaceId;

      const { lastWorkspaceChainEvent, workspaceChainState } =
        await getLastWorkspaceChainEventWithState({ prisma, workspaceId });

      const newState = workspaceChain.applyEvent(
        workspaceChainState,
        workspaceChainEvent
      );

      const allEvents = await prisma.workspaceChainEvent.findMany();
      await prisma.workspaceChainEvent.create({
        data: {
          content: workspaceChainEvent,
          state: newState,
          workspaceId,
          position: lastWorkspaceChainEvent.position + 1,
        },
      });

      if (workspaceInvitation.role !== workspaceChainEvent.transaction.role) {
        throw new Error("Roles don't match");
      }

      // create a new user to workspace relationship
      await prisma.usersToWorkspaces.create({
        data: {
          userId: currentUserId,
          workspaceId,
          role: workspaceInvitation.role,
          isAuthorizedMember: false,
        },
      });

      return workspaceId;
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );
}
