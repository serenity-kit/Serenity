import * as userChain from "@serenity-kit/user-chain";
import { Prisma } from "../../../prisma/generated/output";
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
  return await prisma.$transaction(
    async (prisma) => {
      if (removeDeviceEvent) {
        // currently a 1 to 1 relationship, but that could change
        const sessionDevice = await prisma.session.findFirstOrThrow({
          where: { userId, sessionKey, expiresAt: { gt: new Date() } },
          select: { deviceSigningPublicKey: true },
        });
        if (
          sessionDevice.deviceSigningPublicKey !==
          removeDeviceEvent.transaction.signingPublicKey
        ) {
          throw new Error("Device signing public key does not match on logout");
        }
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

        await prisma.device.delete({
          where: {
            signingPublicKey: removeDeviceEvent.transaction.signingPublicKey,
          },
        });
      }

      await prisma.session.deleteMany({
        where: {
          userId,
          sessionKey,
        },
      });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );
};
