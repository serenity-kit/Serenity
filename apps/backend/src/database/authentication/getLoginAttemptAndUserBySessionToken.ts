import { prisma } from "../prisma";

type Params = {
  sessionToken: string;
};

export async function getLoginAttemptAndUserBySessionToken({
  sessionToken,
}: Params) {
  const loginAttempt = await prisma.loginAttempt.findFirstOrThrow({
    where: {
      sessionToken,
      // only valid for 30 seconds
      createdAt: { lt: new Date(Date.now() + 1000 * 30) },
    },
  });
  const user = await prisma.user.findUniqueOrThrow({
    where: { username: loginAttempt.username },
  });
  return { loginAttempt, user };
}
