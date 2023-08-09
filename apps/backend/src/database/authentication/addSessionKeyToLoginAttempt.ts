import { prisma } from "../prisma";

type Params = {
  loginId: string;
  sessionKey: string;
};

export async function addSessionKeyToLoginAttempt({
  loginId,
  sessionKey,
}: Params) {
  return await prisma.loginAttempt.update({
    where: {
      id: loginId,
    },
    data: {
      sessionKey,
    },
  });
}
