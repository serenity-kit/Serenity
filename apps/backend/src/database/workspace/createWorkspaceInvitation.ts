import { ForbiddenError, UserInputError } from "apollo-server-express";
import canonicalize from "canonicalize";
import sodium from "react-native-libsodium";
import { Role } from "../../../prisma/generated/output";
import { WorkspaceInvitation } from "../../types/workspace";
import { getRoleAsString } from "../../utils/getRoleAsString";
import { prisma } from "../prisma";

// by default, invitation expires in 48 hours
const INVITATION_EXPIRATION_TIME = 48 * 60 * 60 * 1000;

type Params = {
  workspaceId: string;
  invitationId: string;
  invitationSigningPublicKey: string;
  expiresAt: Date;
  invitationDataSignature: string;
  role: Role;
  inviterUserId: string;
};

export async function createWorkspaceInvitation({
  workspaceId,
  invitationId,
  invitationSigningPublicKey,
  invitationDataSignature,
  expiresAt,
  role,
  inviterUserId,
}: Params) {
  console.log({
    workspaceId,
    invitationId,
    invitationSigningPublicKey,
    invitationDataSignature,
    expiresAt,
    role,
    inviterUserId,
  });
  const expiresAtErrorMarginMillis = 1000 * 60 * 60 * 2; // 2 hours
  const maxExpirationTime = new Date(Date.now() + expiresAtErrorMarginMillis);
  if (maxExpirationTime > expiresAt) {
    throw new UserInputError(
      "The invitation expiration time is too far in the future"
    );
  }
  const roleAsString = getRoleAsString(role);
  if (!roleAsString) {
    throw new UserInputError("Invalid sharing role");
  }
  const expectedSigningData = canonicalize({
    workspaceId,
    invitationId,
    invitationSigningPublicKey,
    role: roleAsString,
    expiresAt: expiresAt.toISOString(),
  });
  console.log({ expectedSigningData });
  const doesSignatureVerify = sodium.crypto_sign_verify_detached(
    sodium.from_base64(invitationDataSignature),
    expectedSigningData!,
    sodium.from_base64(invitationSigningPublicKey)
  );
  console.log({ doesSignatureVerify });
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
  console.log({ userToWorkspace });
  if (!userToWorkspace || !userToWorkspace.role) {
    throw new ForbiddenError("Unauthorized");
  }
  console.log({ userToWorkspace });
  const rawWorkspaceInvitation = await prisma.workspaceInvitations.create({
    data: {
      id: invitationId,
      workspaceId,
      inviterUserId,
      invitationSigningPublicKey,
      invitationDataSignature,
      role: Role.ADMIN,
      expiresAt: new Date(Date.now() + INVITATION_EXPIRATION_TIME),
    },
  });
  console.log({ rawWorkspaceInvitation });
  const workspaceInvitation: WorkspaceInvitation = {
    ...rawWorkspaceInvitation,
    inviterUsername: userToWorkspace.user.username,
    workspaceName: userToWorkspace.workspace.name,
  };
  console.log({ workspaceInvitation });
  return workspaceInvitation;
}
