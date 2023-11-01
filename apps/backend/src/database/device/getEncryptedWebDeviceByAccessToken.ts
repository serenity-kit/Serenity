import { prisma } from "../prisma";

type Params = {
  webDeviceAccessToken: string;
};
export async function getEncryptedWebDeviceByAccessToken({
  webDeviceAccessToken,
}: Params) {
  const deviceInfo = await prisma.device.findFirstOrThrow({
    where: {
      webDeviceAccessToken,
      expiresAt: {
        gt: new Date(),
      },
    },
    select: {
      webDeviceCiphertext: true,
      webDeviceNonce: true,
    },
  });
  return deviceInfo;
}
