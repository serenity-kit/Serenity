import { PrismaClient } from "@prisma/client";
import * as workspaceChain from "@serenity-kit/workspace-chain";

type Params = {
  prisma: PrismaClient;
  workspaceId: string;
};
export async function getLastWorkspaceChainEventWithState({
  prisma,
  workspaceId,
}: Params) {
  const lastWorkspaceChainEvent =
    await prisma.workspaceChainEvent.findFirstOrThrow({
      where: { workspaceId },
      orderBy: { position: "desc" },
    });
  const workspaceChainState = workspaceChain.WorkspaceChainState.parse(
    lastWorkspaceChainEvent.state
  );
  return { lastWorkspaceChainEvent, workspaceChainState };
}
