import * as userChain from "@serenity-kit/user-chain";
import { prisma } from "../prisma";
import { getLastUserChainEventWithState } from "../userChain/getLastUserChainEventWithState";

export type Props = {
  userId: string;
  sessionKey: string;
  removeDeviceEvent: userChain.RemoveDeviceEvent | null;
};
export const logout = async ({
  userId,
  sessionKey,
  removeDeviceEvent,
}: Props) => {
  return await prisma.$transaction(async (prisma) => {
    const sessionDevices = await prisma.session.findMany({
      where: { userId, sessionKey },
      select: { deviceSigningPublicKey: true },
    });
    const deviceSigningPublicKeys = sessionDevices.map(
      (sessionDevice) => sessionDevice.deviceSigningPublicKey
    );
    if (removeDeviceEvent) {
      const { lastUserChainEvent, userChainState } =
        await getLastUserChainEventWithState({ prisma, userId });

      const newUserChainState = userChain.applyEvent({
        state: userChainState,
        event: removeDeviceEvent,
        knownVersion: userChain.version,
      });

      await prisma.userChainEvent.create({
        data: {
          content: removeDeviceEvent,
          state: newUserChainState,
          userId,
          position: lastUserChainEvent.position + 1,
        },
      });

      await prisma.device.deleteMany({
        where: { signingPublicKey: { in: deviceSigningPublicKeys } },
      });
    }

    await prisma.session.deleteMany({
      where: {
        userId,
        sessionKey,
      },
    });
  });
};
