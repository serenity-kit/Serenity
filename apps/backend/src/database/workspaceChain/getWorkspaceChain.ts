import { ForbiddenError } from "apollo-server-express";
import { prisma } from "../prisma";

type Cursor = {
  id?: string;
};

type Params = {
  userId: string;
  cursor?: Cursor;
  skip?: number;
  take: number;
  workspaceId: string;
};
export async function getWorkspaceChain({
  userId,
  workspaceId,
}: // cursor,
// skip,
// take,
Params) {
  const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
    where: { userId, workspaceId },
  });
  if (!userToWorkspace) {
    throw new ForbiddenError("Unauthorized");
  }

  const workspaceChain = await prisma.workspaceChainEvent.findMany({
    where: {
      workspaceId,
    },
    // cursor,
    // skip,
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
