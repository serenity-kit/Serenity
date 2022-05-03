import { prisma } from "../prisma";

export async function getDeviceIncludingUser(deviceSigningPublicKey: string) {
  const device = await prisma.device.findUnique({
    where: {
      signingPublicKey: deviceSigningPublicKey,
    },
    include: {
      user: true,
    },
  });
  return device;
}
