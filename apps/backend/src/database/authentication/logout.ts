import { prisma } from "../prisma";

export type Props = {
  userId: string;
  sessionKey: string;
};
export const logout = async ({ userId, sessionKey }: Props) => {
  return await prisma.$transaction(async (prisma) => {
    const sessionDevices = await prisma.session.findMany({
      where: { userId, sessionKey },
      select: { deviceSigningPublicKey: true },
    });
    const deviceSigningPublicKeys = sessionDevices.map(
      (sessionDevice) => sessionDevice.deviceSigningPublicKey
    );
    await prisma.session.deleteMany({
      where: {
        userId,
        sessionKey,
      },
    });
    await prisma.device.deleteMany({
      where: { signingPublicKey: { in: deviceSigningPublicKeys } },
    });
  });
};
