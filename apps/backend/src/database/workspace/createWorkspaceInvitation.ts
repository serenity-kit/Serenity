import * as workspaceChain from "@serenity-kit/workspace-chain";
import { ForbiddenError, UserInputError } from "apollo-server-express";
import canonicalize from "canonicalize";
import sodium from "react-native-libsodium";
import { Prisma, Role } from "../../../prisma/generated/output";
import { WorkspaceInvitation } from "../../types/workspace";
import { prisma } from "../prisma";
import { getLastWorkspaceChainEventWithState } from "../workspaceChain/getLastWorkspaceChainEventWithState";

type Params = {
  workspaceId: string;
  inviterUserId: string;
  workspaceChainEvent: workspaceChain.AddInvitationWorkspaceChainEvent;
};

export async function createWorkspaceInvitation({
  workspaceId,
  workspaceChainEvent,
  inviterUserId,
}: Params) {
  if (workspaceId !== workspaceChainEvent.transaction.workspaceId) {
    throw new UserInputError("The workspace ID does not match");
  }

  const expiresAt = new Date(workspaceChainEvent.transaction.expiresAt);
  const invitationId = workspaceChainEvent.transaction.invitationId;
  const invitationSigningPublicKey =
    workspaceChainEvent.transaction.invitationSigningPublicKey;
  const invitationDataSignature =
    workspaceChainEvent.transaction.invitationDataSignature;
  const role = workspaceChainEvent.transaction.role;

  const expiresAtErrorMarginMillis = 1000 * 60 * 60 * 2; // 2 hours
  const maxExpirationTime = new Date(Date.now() + expiresAtErrorMarginMillis);
  if (maxExpirationTime > expiresAt) {
    throw new UserInputError(
      "The invitation expiration time is too far in the future"
    );
  }
  const expectedSigningData = canonicalize({
    workspaceId,
    invitationId,
    invitationSigningPublicKey,
    role,
    expiresAt: expiresAt.toISOString(),
  });
  const doesSignatureVerify = sodium.crypto_sign_verify_detached(
    sodium.from_base64(invitationDataSignature),
    expectedSigningData!,
    sodium.from_base64(invitationSigningPublicKey)
  );
  if (!doesSignatureVerify) {
    throw new UserInputError("invalid invitationDataSignature");
  }

  return await prisma.$transaction(
    async (prisma) => {
      const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
        where: {
          userId: inviterUserId,
          workspaceId,
          role: Role.ADMIN,
        },
        select: {
          userId: true,
          user: {
            select: {
              id: true,
              username: true,
            },
          },
          workspaceId: true,
          workspace: {
            select: { id: true },
          },
          role: true,
        },
      });
      if (
        !userToWorkspace ||
        !userToWorkspace.role ||
        userToWorkspace.role !== Role.ADMIN
      ) {
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

      const rawWorkspaceInvitation = await prisma.workspaceInvitations.create({
        data: {
          id: invitationId,
          workspaceId,
          inviterUserId,
          invitationSigningPublicKey,
          invitationDataSignature,
          role,
          // TODO maybe additionally check that the date is not very far in the future
          expiresAt: workspaceChainEvent.transaction.expiresAt,
        },
      });
      const workspaceInvitation: WorkspaceInvitation = {
        ...rawWorkspaceInvitation,
        inviterUsername: userToWorkspace.user.username,
      };
      return workspaceInvitation;
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );
}
