import { deriveSessionAuthorization } from "@serenity-tools/common";
import { prisma } from "../prisma";

type Params = {
  loginId: string;
  sessionKey: string;
};

export async function addSessionKeyToLoginAttempt({
  loginId,
  sessionKey,
}: Params) {
  const { sessionToken } = deriveSessionAuthorization({ sessionKey });
  return await prisma.loginAttempt.update({
    where: {
      id: loginId,
    },
    data: {
      sessionKey,
      sessionToken,
    },
  });
}
