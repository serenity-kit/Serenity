import { ForbiddenError } from "apollo-server-express";
import { prisma } from "../prisma";

type Params = {
  userId: string;
  signingPublicKey: string;
};

export async function getRelatedDeviceBySigningPublicKey({
  userId,
  signingPublicKey,
}: Params) {
  const userToWorkspaces = await prisma.usersToWorkspaces.findMany({
    where: { userId, isAuthorizedMember: true },
    select: { workspaceId: true },
  });
  const workspaceIds = userToWorkspaces.map(
    (userToWorkspace) => userToWorkspace.workspaceId
  );
  const relatedUsersToWorkspaces = await prisma.usersToWorkspaces.findMany({
    where: { workspaceId: { in: workspaceIds } },
    select: { userId: true },
  });
  const relatedUserIds = relatedUsersToWorkspaces.map(
    (userToWorkspace) => userToWorkspace.userId
  );
  const device = await prisma.device.findFirst({
    where: {
      signingPublicKey,
      userId: { in: relatedUserIds },
    },
  });
  if (!device) {
    throw new ForbiddenError("Unauthorized");
  }
  return device;
}
