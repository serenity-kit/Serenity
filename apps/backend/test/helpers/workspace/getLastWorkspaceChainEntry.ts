import * as workspaceChain from "@serenity-kit/workspace-chain";
import { prisma } from "../../../src/database/prisma";

export type Props = {
  workspaceId: string;
};
export const getLastWorkspaceChainEntry = async ({ workspaceId }: Props) => {
  const lastChainEntryFromDb =
    await prisma.workspaceChainEntry.findFirstOrThrow({
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
