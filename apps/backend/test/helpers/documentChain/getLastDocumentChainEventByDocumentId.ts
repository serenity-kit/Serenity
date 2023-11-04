import * as documentChain from "@serenity-kit/document-chain";
import { prisma } from "../../../src/database/prisma";

export type Props = {
  documentId: string;
};
export const getLastDocumentChainEventByDocumentId = async ({
  documentId,
}: Props) => {
  const lastChainEntryFromDb = await prisma.documentChainEvent.findFirstOrThrow(
    {
      where: {
        documentId,
      },
      orderBy: {
        position: "desc",
      },
    }
  );

  const lastChainEvent = documentChain.DocumentChainEvent.parse(
    lastChainEntryFromDb.content
  );

  return {
    lastChainEvent,
    state: lastChainEntryFromDb.state as documentChain.DocumentChainState,
  };
};
