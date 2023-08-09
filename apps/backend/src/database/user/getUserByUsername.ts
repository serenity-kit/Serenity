import { prisma } from "../prisma";

type Params = {
  username: string;
};

export async function getUserByUsername({ username }: Params) {
  const user = await prisma.user.findUniqueOrThrow({ where: { username } });
  return user;
}
