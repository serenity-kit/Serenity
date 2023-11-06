import * as workspaceChain from "@serenity-kit/workspace-chain";
import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
import { Prisma } from "../../../prisma/generated/output";
import { prisma } from "../prisma";
import { getLastWorkspaceChainEventWithState } from "../workspaceChain/getLastWorkspaceChainEventWithState";
import { updateWorkspaceMemberDevicesProof } from "./updateWorkspaceMemberDevicesProof";

type Params = {
  userId: string;
  workspaceChainEvent: workspaceChain.RemoveInvitationsWorkspaceChainEvent;
  workspaceMemberDevicesProof: workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProof;
  mainDeviceSigningPublicKey: string;
};

export async function deleteWorkspaceInvitations({
  userId,
  workspaceChainEvent,
  workspaceMemberDevicesProof,
  mainDeviceSigningPublicKey,
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

      await updateWorkspaceMemberDevicesProof({
        authorPublicKey: mainDeviceSigningPublicKey,
        userId,
        prisma,
        workspaceId,
        workspaceMemberDevicesProof,
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
