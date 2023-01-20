import { createDevice as createdDeviceHelper } from "@serenity-tools/common";
import { createDevice as saveDevice } from "../../../src/database/device/createDevice";
import { prisma } from "../../../src/database/prisma";

type Params = {
  graphql: any;
  authorizationHeader: string;
};

export const createDevice = async ({
  graphql,
  authorizationHeader,
}: Params) => {
  const session = await prisma.session.findFirst({
    where: { sessionKey: authorizationHeader },
    select: { userId: true },
  });
  if (!session) {
    throw new Error("Session not found");
  }
  const device = createdDeviceHelper();

  const deviceInfoJson = {
    type: "web",
    OS: "MacOS",
    OsVersion: null,
    Browser: "chrome",
    BrowserVersion: "100.0.1",
  };
  const deviceInfo = JSON.stringify(deviceInfoJson);

  await saveDevice({
    userId: session.userId,
    signingPublicKey: device.signingPublicKey,
    encryptionPublicKey: device.encryptionPublicKey,
    encryptionPublicKeySignature: device.encryptionPublicKeySignature,
    info: deviceInfo,
  });
  return { localDevice: device };
};
