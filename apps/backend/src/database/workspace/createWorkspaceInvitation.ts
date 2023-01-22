import { ForbiddenError, UserInputError } from "apollo-server-express";
import canonicalize from "canonicalize";
import sodium from "react-native-libsodium";
import { Role } from "../../../prisma/generated/output";
import { WorkspaceInvitation } from "../../types/workspace";
import { prisma } from "../prisma";

// by default, invitation expires in 48 hours
const INVITATION_EXPIRATION_TIME = 48 * 60 * 60 * 1000;

type Params = {
  workspaceId: string;
  invitationId: string;
  invitationSigningPublicKey: string;
  expiresAt: Date;
  invitationDataSignature: string;
  inviterUserId: string;
};

export async function createWorkspaceInvitation({
  workspaceId,
  invitationId,
  invitationSigningPublicKey,
  invitationDataSignature,
  expiresAt,
  inviterUserId,
}: Params) {
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
        select: {
          id: true,
          name: true,
        },
      },
      role: true,
    },
  });
  if (!userToWorkspace || !userToWorkspace.role) {
    throw new ForbiddenError("Unauthorized");
  }
  const rawWorkspaceInvitation = await prisma.workspaceInvitations.create({
    data: {
      id: invitationId,
      workspaceId,
      inviterUserId,
      invitationSigningPublicKey,
      invitationDataSignature,
      expiresAt: new Date(Date.now() + INVITATION_EXPIRATION_TIME),
    },
  });
  const workspaceInvitation: WorkspaceInvitation = {
    ...rawWorkspaceInvitation,
    inviterUsername: userToWorkspace.user.username,
    workspaceName: userToWorkspace.workspace.name,
  };
  return workspaceInvitation;
}
