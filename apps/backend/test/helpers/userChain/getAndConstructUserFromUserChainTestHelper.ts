import { constructUserFromSerializedUserChain } from "@serenity-tools/common";
import { prisma } from "../../../src/database/prisma";

export type Props = {
  mainDeviceSigningPublicKey: string;
};
export const getAndConstructUserFromUserChainTestHelper = async ({
  mainDeviceSigningPublicKey,
}: Props) => {
  const chainEntriesFromDb = await prisma.userChainEvent.findMany({
    where: { user: { mainDeviceSigningPublicKey } },
    orderBy: { position: "asc" },
  });

  return constructUserFromSerializedUserChain({
    serializedUserChain: chainEntriesFromDb.map((chainEntry) => {
      return {
        ...chainEntry,
        serializedContent: JSON.stringify(chainEntry.content),
      };
    }),
  });
};
