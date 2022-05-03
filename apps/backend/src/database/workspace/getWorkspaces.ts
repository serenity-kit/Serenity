import { prisma } from "../prisma";

type Cursor = {
  id?: string;
};

type Params = {
  username: string;
  cursor?: Cursor;
  skip?: number;
  take: number;
};
export async function getWorkspaces({ username, cursor, skip, take }: Params) {
  return await prisma.workspace.findMany({
    where: {
      usersToWorkspaces: {
        every: {
          username: username,
        },
      },
    },
    cursor,
    skip,
    take,
    orderBy: {
      name: "asc",
    },
  });
}
