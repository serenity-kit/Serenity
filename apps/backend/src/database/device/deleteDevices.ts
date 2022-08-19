import { prisma } from "../prisma";

type Params = {
  userId: string;
  signingPublicKeys: string[];
};

export async function deleteDevices({
  userId,
  signingPublicKeys,
}: Params): Promise<void> {
  return await prisma.$transaction(async (prisma) => {
    await prisma.device.deleteMany({
      where: {
        signingPublicKey: {
          in: signingPublicKeys,
        },
        userId,
      },
    });
    return;
  });
}
