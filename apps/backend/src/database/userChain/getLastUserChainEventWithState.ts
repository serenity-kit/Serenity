import { PrismaClient } from "@prisma/client";
import * as userChain from "@serenity-kit/user-chain";

type Params = {
  prisma: PrismaClient;
  userId: string;
};
export async function getLastUserChainEventWithState({
  prisma,
  userId,
}: Params) {
  const lastUserChainEvent = await prisma.userChainEvent.findFirstOrThrow({
    where: { userId },
    orderBy: { position: "desc" },
  });
  const userChainState = userChain.UserChainState.parse(
    lastUserChainEvent.state
  );
  return { lastUserChainEvent, userChainState };
}
