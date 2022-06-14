import { prisma } from "../prisma";

export async function getEnvelope(username: string): Promise<{
  envelope: string;
}> {
  // if this user does not exist, we have a problem
  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });
  if (!user) {
    throw Error("User is not registered");
  }
  return {
    envelope: user.opaqueEnvelope,
  };
}
