import { ForbiddenError } from "apollo-server-express";
import { WorkspaceKey } from "../../../prisma/generated/output";
import { prisma } from "../prisma";

export type Props = {
  userId: string;
  workspaceId: string;
  deviceSigningPublicKey: string;
};
export const getActiveWorkspaceKeys = async ({
  userId,
  workspaceId,
  deviceSigningPublicKey,
}: Props): Promise<WorkspaceKey[]> => {
  const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
    where: { userId, workspaceId },
  });
  if (!userToWorkspace) {
    throw new ForbiddenError("Unauthorized");
  }
  // get all workspaceKeys associated with a workspace;
  const workspaceKeys = await prisma.workspaceKey.findMany({
    where: { workspaceId },
    include: {
      workspaceKeyBoxes: {
        where: { deviceSigningPublicKey },
        include: {
          creatorDevice: true,
        },
      },
    },
  });
  return workspaceKeys;
};
