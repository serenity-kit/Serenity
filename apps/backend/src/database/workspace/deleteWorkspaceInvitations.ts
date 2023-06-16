import * as workspaceChain from "@serenity-kit/workspace-chain";
import { prisma } from "../prisma";

type Params = {
  workspaceChainEvent: workspaceChain.RemoveInvitationsWorkspaceChainEvent;
};

export async function deleteWorkspaceInvitations({
  workspaceChainEvent,
}: Params) {
  await prisma.$transaction(async (prisma) => {
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

    // delete workspace invitations
    await prisma.workspaceInvitations.deleteMany({
      where: { id: { in: workspaceChainEvent.transaction.invitationIds } },
    });
  });
}
