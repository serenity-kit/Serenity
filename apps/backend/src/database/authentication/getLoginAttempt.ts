import { prisma } from "../prisma";

type Params = {
  loginAttemptId: string;
};

export async function getLoginAttempt({ loginAttemptId }: Params) {
  return await prisma.loginAttempt.findFirstOrThrow({
    where: {
      id: loginAttemptId,
      // only valid for 30 seconds
      createdAt: { lt: new Date(Date.now() + 1000 * 30) },
    },
  });
}
