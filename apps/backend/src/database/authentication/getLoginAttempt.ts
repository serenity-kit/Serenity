import { prisma } from "../prisma";

type Params = {
  loginAttemptId: string;
};

export async function getLoginAttempt({ loginAttemptId }: Params) {
  return await prisma.loginAttempt.findUniqueOrThrow({
    where: {
      id: loginAttemptId,
    },
  });
}
