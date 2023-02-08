import { Device } from "@serenity-tools/common";
import { Role } from "../../../prisma/generated/output";
import { prisma } from "../../../src/database/prisma";
import { TestContext } from "../setupGraphql";
import { acceptWorkspaceInvitation } from "./acceptWorkspaceInvitation";
import { createWorkspaceInvitation } from "./createWorkspaceInvitation";

export type Props = {
  graphql: TestContext;
  hostUserId: string;
  hostSessionKey: string;
  guestUserId: string;
  guestSessionKey: string;
  guestMainDevice: Device;
  workspaceId: string;
  role: Role;
};
export const attachUserToWorkspace = async ({
  graphql,
  hostUserId,
  hostSessionKey,
  guestUserId,
  guestSessionKey,
  guestMainDevice,
  workspaceId,
  role,
}) => {
  const guestUser = await prisma.user.findFirst({
    where: { id: guestUserId },
  });
  if (!guestUser) {
    throw new Error("Guest user not found");
  }
  const workspaceInvitationResult = await createWorkspaceInvitation({
    graphql,
    workspaceId,
    authorizationHeader: hostSessionKey,
  });
  const workspaceInvitation =
    workspaceInvitationResult.createWorkspaceInvitation.workspaceInvitation;
  const invitationSigningPrivateKey =
    workspaceInvitationResult.invitationSigningPrivateKey;
  await acceptWorkspaceInvitation({
    graphql,
    workspaceInvitationId: workspaceInvitation.id,
    invitationSigningPrivateKey,
    inviteeUsername: guestUser.username,
    inviteeMainDevice: guestMainDevice,
    authorizationHeader: guestSessionKey,
  });
  await prisma.usersToWorkspaces.updateMany({
    where: {
      workspaceId,
      userId: guestUserId,
    },
    data: {
      role,
    },
  });
  // TODO: encrypt workspaceKeys for user2
};
