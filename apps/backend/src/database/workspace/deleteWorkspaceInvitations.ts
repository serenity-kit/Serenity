import * as workspaceChain from "@serenity-kit/workspace-chain";
import { Prisma } from "../../../prisma/generated/output";
import { prisma } from "../prisma";
import { getLastWorkspaceChainEventWithState } from "../workspaceChain/getLastWorkspaceChainEventWithState";

type Params = {
  workspaceChainEvent: workspaceChain.RemoveInvitationsWorkspaceChainEvent;
};

export async function deleteWorkspaceInvitations({
  workspaceChainEvent,
}: Params) {
  await prisma.$transaction(
    async (prisma) => {
      // get the invitations to find to check they only belong to one workspace
      // and then apply the event
      const workspaceInvitations = await prisma.workspaceInvitations.findMany({
        where: { id: { in: workspaceChainEvent.transaction.invitationIds } },
      });
      const workspaceIds = workspaceInvitations.map(
        (invitation) => invitation.workspaceId
      );
      const workspaceIdSet = new Set(workspaceIds);
      if (workspaceIdSet.size > 1) {
        throw new Error("Can only delete invitations from one workspace");
      }
      const workspaceId = workspaceIds[0];

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

      // delete workspace invitations
      await prisma.workspaceInvitations.deleteMany({
        where: { id: { in: workspaceChainEvent.transaction.invitationIds } },
      });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );
}
