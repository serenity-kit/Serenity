import { ForbiddenError } from "apollo-server-express";
import { prisma } from "../prisma";

type Params = {
  userId: string;
  afterPosition?: number;
  skip?: number;
  take: number;
  workspaceId: string;
};
export async function getWorkspaceChain({
  userId,
  workspaceId,
  // take,
  afterPosition,
  skip,
}: Params) {
  const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
    where: { userId, workspaceId },
  });
  if (!userToWorkspace) {
    throw new ForbiddenError("Unauthorized");
  }

  const workspaceChain = await prisma.workspaceChainEvent.findMany({
    where: { workspaceId },
    cursor: afterPosition
      ? { workspaceId_position: { workspaceId, position: afterPosition } }
      : undefined,
    skip,
    // take,
    orderBy: {
      position: "asc",
    },
    select: {
      position: true,
      content: true,
    },
  });
  return workspaceChain.map((workspaceChainEvent) => {
    return {
      ...workspaceChainEvent,
      serializedContent: JSON.stringify(workspaceChainEvent.content),
    };
  });
}
