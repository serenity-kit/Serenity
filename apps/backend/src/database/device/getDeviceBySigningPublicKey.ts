import { ForbiddenError } from "apollo-server-express";
import { prisma } from "../prisma";

type Params = {
  userId: string;
  signingPublicKey: string;
};

export async function getDeviceBySigningPublicKey({
  userId,
  signingPublicKey,
}: Params) {
  // TODO: force the user to sign the keys?
  const device = await prisma.device.findFirst({
    where: {
      signingPublicKey,
      userId,
    },
  });
  if (!device) {
    throw new ForbiddenError("Unauthorized");
  }
  return device;
}
