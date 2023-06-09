import * as workspaceChain from "@serenity-kit/workspace-chain";
import { ForbiddenError } from "apollo-server-express";
import { prisma } from "../prisma";

type Params = {
  workspaceChainEvent: workspaceChain.AcceptInvitationWorkspaceChainEvent;
  currentUserId: string;
};

export async function acceptWorkspaceInvitation({
  workspaceChainEvent,
  currentUserId,
}: Params): Promise<string> {
  return await prisma.$transaction(async (prisma) => {
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
  });
}
