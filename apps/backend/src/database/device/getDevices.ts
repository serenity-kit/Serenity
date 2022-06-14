import { prisma } from "../prisma";

type Cursor = {
  signingPublicKey?: string;
};

type Params = {
  userId: string;
  cursor?: Cursor;
  skip?: number;
  take: number;
};
export async function getDevices({ userId, cursor, skip, take }: Params) {
  // TODO: force the user to sign the keys?
  const devices = await prisma.device.findMany({
    where: {
      userId,
    },
    cursor,
    skip,
    take,
  });
  return devices;
}
