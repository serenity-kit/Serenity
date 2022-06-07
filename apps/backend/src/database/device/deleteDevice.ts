import { prisma } from "../prisma";

type Params = {
  userId: string;
  signingPublicKey: string;
};

export async function deleteDevice({
  userId,
  signingPublicKey,
}: Params): Promise<void> {
  // TODO: force the user to sign the keys?
  await prisma.device.deleteMany({
    where: {
      signingPublicKey,
      userId,
    },
  });
  return;
}
