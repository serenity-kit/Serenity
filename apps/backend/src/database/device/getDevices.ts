import { isDeviceWithUserId } from "../../utils/device/isDeviceWithUserId";
import { prisma } from "../prisma";

type Cursor = {
  signingPublicKey?: string;
};

type Params = {
  userId: string;
  onlyNotExpired: boolean;
  cursor?: Cursor;
  skip?: number;
  take: number;
};
export async function getDevices({
  userId,
  onlyNotExpired,
  cursor,
  skip,
  take,
}: Params) {
  const allDevices = await prisma.device.findMany({
    where: onlyNotExpired
      ? {
          OR: [
            {
              userId,
              expiresAt: { gt: new Date() },
            },
            {
              userId,
              expiresAt: null, // main devices don't expire
            },
          ],
        }
      : {
          userId,
        },
    cursor,
    skip,
    take,
    orderBy: {
      createdAt: "asc",
    },
  });
  return allDevices.filter(isDeviceWithUserId);
}
