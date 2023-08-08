import { prisma } from "../prisma";

type Cursor = {
  id?: string;
};

type Params = {
  username: string;
  cursor?: Cursor;
  skip?: number;
  // take: number;
};
export async function getUserChainByUsername({
  username,
}: // cursor,
// skip,
// take,
Params) {
  const userChain = await prisma.userChainEvent.findMany({
    where: {
      user: { username },
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
  return userChain.map((userChainEvent) => {
    return {
      ...userChainEvent,
      serializedContent: JSON.stringify(userChainEvent.content),
    };
  });
}
