import * as workspaceChain from "@serenity-kit/workspace-chain";
import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
import { ForbiddenError } from "apollo-server-express";
import { Prisma } from "../../../prisma/generated/output";
import { prisma } from "../prisma";
import { getLastUserChainEventWithState } from "../userChain/getLastUserChainEventWithState";
import { getLastWorkspaceChainEventWithState } from "../workspaceChain/getLastWorkspaceChainEventWithState";
import { updateWorkspaceMemberDevicesProof } from "./updateWorkspaceMemberDevicesProof";

type Params = {
  workspaceChainEvent: workspaceChain.AcceptInvitationWorkspaceChainEvent;
  currentUserId: string;
  workspaceMemberDevicesProof: workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProof;
  mainDeviceSigningPublicKey: string;
};

export async function acceptWorkspaceInvitation({
  workspaceChainEvent,
  currentUserId,
  workspaceMemberDevicesProof,
  mainDeviceSigningPublicKey,
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

      const { userChainState } = await getLastUserChainEventWithState({
        userId: currentUserId,
        prisma,
      });

      await updateWorkspaceMemberDevicesProof({
        authorPublicKey: mainDeviceSigningPublicKey,
        userId: currentUserId,
        userChainEventHash: userChainState.eventHash,
        prisma,
        workspaceId,
        workspaceMemberDevicesProof,
      });

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
