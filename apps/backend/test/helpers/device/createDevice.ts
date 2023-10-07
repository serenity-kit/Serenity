import { createDevice as createdDeviceHelper } from "@serenity-tools/common";
import { prisma } from "../../../src/database/prisma";

type Params = {
  expiresAt?: Date;
  userId: string;
};

export const createDevice = async ({ userId, expiresAt }: Params) => {
  const device = createdDeviceHelper("user");

  const deviceInfoJson = {
    type: "web",
    OS: "MacOS",
    OsVersion: null,
    Browser: "chrome",
    BrowserVersion: "100.0.1",
  };
  const deviceInfo = JSON.stringify(deviceInfoJson);

  await prisma.device.create({
    data: {
      signingPublicKey: device.signingPublicKey,
      encryptionPublicKey: device.encryptionPublicKey,
      encryptionPublicKeySignature: device.encryptionPublicKeySignature,
      info: deviceInfo,
      user: { connect: { id: userId } },
      expiresAt,
    },
  });

  return { localDevice: device };
};
