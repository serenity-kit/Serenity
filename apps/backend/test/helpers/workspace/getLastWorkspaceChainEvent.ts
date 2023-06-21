import * as workspaceChain from "@serenity-kit/workspace-chain";
import { prisma } from "../../../src/database/prisma";

export type Props = {
  workspaceId: string;
};
export const getLastWorkspaceChainEvent = async ({ workspaceId }: Props) => {
  const lastChainEntryFromDb =
    await prisma.workspaceChainEvent.findFirstOrThrow({
      where: {
        workspaceId,
      },
      orderBy: {
        position: "desc",
      },
    });

  const lastChainEntry = workspaceChain.WorkspaceChainEvent.parse(
    lastChainEntryFromDb.content
  );

  return {
    lastChainEntry,
  };
};
