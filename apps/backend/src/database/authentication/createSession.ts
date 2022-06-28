import { prisma } from "../prisma";

type Params = {
  sessionKey: string;
  expiresAt: Date;
  username: string;
};

export async function createSession({
  sessionKey,
  expiresAt,
  username,
}: Params) {
  return await prisma.session.create({
    data: {
      sessionKey,
      expiresAt,
      user: { connect: { username } },
    },
  });
}
