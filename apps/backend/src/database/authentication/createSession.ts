import { Device } from "@serenity-tools/common";
import { prisma } from "../prisma";

export type DeviceWithInfo = Device & {
  info: string;
};

type Params = {
  sessionKey: string;
  expiresAt: Date;
  username: string;
  device: DeviceWithInfo;
};

export async function createSession({
  sessionKey,
  expiresAt,
  username,
  device,
}: Params) {
  return await prisma.session.create({
    data: {
      sessionKey,
      expiresAt,
      user: { connect: { username } },
      device: {
        create: {
          signingPublicKey: device.signingPublicKey,
          encryptionPublicKey: device.encryptionPublicKey,
          encryptionPublicKeySignature: device.encryptionPublicKeySignature,
          info: device.info,
          user: { connect: { username } },
        },
      },
    },
  });
}
