import { ForbiddenError } from "apollo-server-express";
import { prisma } from "../prisma";

type Cursor = {
  signingPublicKey?: string;
};

type Params = {
  userId: string;
  workspaceId: string;
  cursor?: Cursor;
  skip?: number;
  take: number;
};
export async function getWorkspaceDevices({
  userId,
  workspaceId,
  cursor,
  skip,
  take,
}: Params) {
  const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
    where: {
      userId,
      workspaceId,
    },
  });
  if (!userToWorkspace) {
    throw new ForbiddenError("Unauthorized");
  }
  const workspaceKeyBoxes = await prisma.workspaceKeyBox.findMany({
    where: { workspaceKey: { workspaceId } },
  });
  const deviceSigningPublicKeys = workspaceKeyBoxes.map(
    (workspaceKeyBox) => workspaceKeyBox.deviceSigningPublicKey
  );
  const devices = await prisma.device.findMany({
    where: { signingPublicKey: { in: deviceSigningPublicKeys } },
    cursor,
    skip,
    take,
  });
  return devices;
}
