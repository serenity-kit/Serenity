import { prisma } from "../prisma";

export async function getRegistrationRecord(username: string): Promise<{
  envelop: string;
}> {
  // if this user does not exist, we have a problem
  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });
  if (!user) {
    throw new Error("User is not registered");
  }
  return {
    envelop: user.registrationRecord,
  };
}
