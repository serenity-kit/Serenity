import { ForbiddenError } from "apollo-server-express";
import { prisma } from "../../database/prisma";
import { WorkspaceKey } from "../../types/workspace";

type Cursor = {
  id?: string;
};

export type Props = {
  userId: string;
  workspaceId: string;
  deviceSigningPublicKey: string;
  cursor?: Cursor;
  skip?: number;
  take: number;
};
export const getWorskpaceKeysForWorkspace = async ({
  userId,
  workspaceId,
  deviceSigningPublicKey,
  cursor,
  skip,
  take,
}: Props): Promise<WorkspaceKey[]> => {
  const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
    where: { userId, workspaceId },
  });
  if (!userToWorkspace) {
    throw new ForbiddenError("Unauthorized");
  }
  const rawWorkspaceKeys = await prisma.workspaceKey.findMany({
    where: { workspaceId },
    include: {
      workspaceKeyBoxes: {
        where: { deviceSigningPublicKey },
      },
    },
    cursor,
    skip,
    take,
    orderBy: {
      generation: "desc",
    },
  });
  const workspaceKeys: WorkspaceKey[] = [];
  rawWorkspaceKeys.forEach((workspaceKey) => {
    const workspaceKeyBox = workspaceKey.workspaceKeyBoxes[0];
    if (workspaceKeyBox) {
      workspaceKeys.push({
        ...workspaceKey,
        workspaceKeyBox,
      });
    }
  });
  return workspaceKeys;
};
