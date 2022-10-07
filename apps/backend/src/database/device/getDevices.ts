import { Session } from "../../../prisma/generated/output";
import { DeviceWithRecentSession } from "../../types/device";
import { prisma } from "../prisma";

type Cursor = {
  signingPublicKey?: string;
};

type Params = {
  userId: string;
  hasNonExpiredSession: boolean;
  cursor?: Cursor;
  skip?: number;
  take: number;
};
export async function getDevices({
  userId,
  hasNonExpiredSession,
  cursor,
  skip,
  take,
}: Params) {
  // TODO: force the user to sign the keys?
  const allDevices = await prisma.device.findMany({
    where: {
      userId,
    },
    cursor,
    skip,
    take,
    orderBy: {
      createdAt: "asc",
    },
  });
  const allDeviceSigningPublicKeys = allDevices.map(
    (device) => device.signingPublicKey
  );
  const query: { [key: string]: any } = {
    userId,
    deviceSigningPublicKey: { in: allDeviceSigningPublicKeys },
  };
  if (!hasNonExpiredSession) {
    query.expiresAt = { gte: new Date() };
  }
  const sessions = await prisma.session.findMany({
    where: query,
    orderBy: { createdAt: "desc" },
  });
  const recentSessionByDeviceSigningPublicKey: { [key: string]: Session } = {};
  sessions.forEach((session) => {
    if (
      !recentSessionByDeviceSigningPublicKey[session.deviceSigningPublicKey]
    ) {
      recentSessionByDeviceSigningPublicKey[session.deviceSigningPublicKey] =
        session;
    }
    // no need to replace since the sessions come in
    // by createdAt desc
  });
  const activeDevices: DeviceWithRecentSession[] = [];
  for (let device of allDevices) {
    const session =
      recentSessionByDeviceSigningPublicKey[device.signingPublicKey];
    if (!hasNonExpiredSession) {
      if (!session) {
        continue;
      }
    }
    activeDevices.push({
      ...device,
      mostRecentSession: session,
    });
  }
  return activeDevices;
}
