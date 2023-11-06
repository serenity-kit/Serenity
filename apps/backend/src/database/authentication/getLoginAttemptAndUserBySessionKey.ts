import { prisma } from "../prisma";

type Params = {
  sessionKey: string;
};

export async function getLoginAttemptAndUserBySessionKey({
  sessionKey,
}: Params) {
  const loginAttempt = await prisma.loginAttempt.findFirstOrThrow({
    where: {
      sessionKey,
      // only valid for 30 seconds
      createdAt: { lt: new Date(Date.now() + 1000 * 30) },
    },
  });
  const user = await prisma.user.findUniqueOrThrow({
    where: { username: loginAttempt.username },
  });
  return { loginAttempt, user };
}
