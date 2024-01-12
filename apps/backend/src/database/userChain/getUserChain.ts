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
  userParams?: {
    userId: string;
    workspaceId: string;
  };
};
export async function getUserChain({
  userId,
  userParams,
}: // cursor,
// skip,
// take,
Params) {
  if (userParams) {
    const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
      where: {
        userId,
        workspaceId: userParams.workspaceId,
        isAuthorizedMember: true,
      },
    });
    if (!userToWorkspace) {
      throw new ForbiddenError("Unauthorized");
    }

    const userToWorkspace2 = await prisma.usersToWorkspaces.findFirst({
      where: {
        userId: userParams.userId,
        workspaceId: userParams.workspaceId,
        isAuthorizedMember: true,
      },
    });
    if (!userToWorkspace2) {
      throw new ForbiddenError("User is not part of this workspace");
    }

    const userChain = await prisma.userChainEvent.findMany({
      where: { userId: userParams.userId },
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
    return userChain.map((userChainEvent) => {
      return {
        ...userChainEvent,
        serializedContent: JSON.stringify(userChainEvent.content),
      };
    });
  } else {
    const userChain = await prisma.userChainEvent.findMany({
      where: { userId },
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
    return userChain.map((userChainEvent) => {
      return {
        ...userChainEvent,
        serializedContent: JSON.stringify(userChainEvent.content),
      };
    });
  }
}
