import * as userChain from "@serenity-kit/user-chain";
import { prisma } from "../../../src/database/prisma";

export type Props = {
  mainDeviceSigningPublicKey: string;
};
export const getLastUserChainEventByMainDeviceSigningPublicKey = async ({
  mainDeviceSigningPublicKey,
}: Props) => {
  const lastChainEntryFromDb = await prisma.userChainEvent.findFirstOrThrow({
    where: {
      user: {
        mainDeviceSigningPublicKey,
      },
    },
    orderBy: {
      position: "desc",
    },
  });

  const lastChainEvent = userChain.UserChainEvent.parse(
    lastChainEntryFromDb.content
  );

  return {
    lastChainEvent,
  };
};
