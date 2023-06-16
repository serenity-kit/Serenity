import { prisma } from "../prisma";

type Params = {
  startLoginServerData: string;
  username: string;
};

export async function createLoginAttempt({
  username,
  startLoginServerData,
}: Params) {
  return await prisma.loginAttempt.create({
    data: {
      username,
      startLoginServerData,
    },
  });
}
