import { prisma } from "../prisma";

type Params = {
  sessionKey: string;
};

export async function getSessionIncludingUser({ sessionKey }: Params) {
  const session = await prisma.session.findUnique({
    where: {
      sessionKey,
    },
    include: {
      user: true,
    },
  });
  if (session?.expiresAt && session.expiresAt < new Date()) {
    return null;
  }
  return session;
}
