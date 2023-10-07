import * as userChain from "@serenity-kit/user-chain";
import { Device } from "@serenity-tools/common";
import { z } from "zod";
import { Prisma } from "../../../prisma/generated/output";
import { addDays } from "../../utils/addDays/addDays";
import { addHours } from "../../utils/addHours/addHours";
import { addYears } from "../../utils/addYears/addYears";
import { prisma } from "../prisma";
import { getLastUserChainEventWithState } from "../userChain/getLastUserChainEventWithState";

export const DeviceType = z.union([
  z.literal("temporary-web"),
  z.literal("web"),
  z.literal("mobile"),
]);

export type DeviceType = z.infer<typeof DeviceType>;

export type DeviceWithInfo = Device & {
  info: string;
};

type Params = {
  sessionKey: string;
  username: string;
  device: DeviceWithInfo;
  addDeviceEvent: userChain.AddDeviceEvent;
  deviceType: string;
};

export async function createSessionAndDevice({
  sessionKey,
  username,
  device,
  addDeviceEvent,
  deviceType: rawDeviceType,
}: Params) {
  if (addDeviceEvent.transaction.signingPublicKey !== device.signingPublicKey) {
    throw new Error(
      "addDeviceEvent.transaction.signingPublicKey does not match device.signingPublicKey"
    );
  }
  const deviceType = DeviceType.parse(rawDeviceType);

  let sessionExpiresAt: Date;
  if (deviceType === "temporary-web" || deviceType === "web") {
    if (addDeviceEvent.transaction.expiresAt === undefined) {
      throw new Error("Invalid device expiration");
    }
    sessionExpiresAt = new Date(addDeviceEvent.transaction.expiresAt);
    if (
      deviceType === "temporary-web" &&
      addHours(new Date(), 25) < sessionExpiresAt
    ) {
      throw new Error("Invalid temporary web device expiration");
    }
    if (deviceType === "web" && addDays(new Date(), 31) < sessionExpiresAt) {
      throw new Error("Invalid web device expiration");
    }
  } else {
    if (addDeviceEvent.transaction.expiresAt !== undefined) {
      throw new Error("Invalid mobile device expiration");
    }
    sessionExpiresAt = addYears(new Date(), 1000);
  }

  return await prisma.$transaction(
    async (prisma) => {
      const user = await prisma.user.findUniqueOrThrow({
        where: { username },
      });
      const userId = user.id;

      const { lastUserChainEvent, userChainState } =
        await getLastUserChainEventWithState({ prisma, userId });

      const newUserChainState = userChain.applyEvent({
        state: userChainState,
        event: addDeviceEvent,
        knownVersion: userChain.version,
      });

      await prisma.userChainEvent.create({
        data: {
          content: addDeviceEvent,
          state: newUserChainState,
          userId,
          position: lastUserChainEvent.position + 1,
        },
      });

      return await prisma.session.create({
        data: {
          sessionKey,
          expiresAt: sessionExpiresAt,
          user: { connect: { username } },
          device: {
            create: {
              signingPublicKey: device.signingPublicKey,
              encryptionPublicKey: device.encryptionPublicKey,
              encryptionPublicKeySignature: device.encryptionPublicKeySignature,
              info: device.info,
              user: { connect: { username } },
              expiresAt: addDeviceEvent.transaction.expiresAt,
            },
          },
        },
      });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );
}
