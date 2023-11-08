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
